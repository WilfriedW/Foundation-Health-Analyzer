// =====================================================================
// SCRIPT: FHAnalysisEngine - Version Refactorisée avec Options
// =====================================================================
// Description: Version améliorée avec gestion modulaire des options
// Date: 2026-01-18
// =====================================================================

var FHAnalysisEngine = Class.create();
FHAnalysisEngine.prototype = {
    initialize: function() {
        // Configuration options cache
        this.options = {};
    },

    /**
     * Executes verification for a configured item (e.g., Flow, Change Request)
     * @param {GlideRecord} configRecord - Configuration record from your "Items to Verify" table
     * @returns {Object} - Verification result { success: Boolean, data: Array, errors: Array, metadata: Object }
     */
    runVerification: function(configRecord) {
        var result = {
            success: false,
            data: [],
            errors: [],
            metadata: {},
        };

        // ============================================================
        // NOUVEAU : Charger et valider les options de configuration
        // ============================================================
        this.options = this._loadConfigurationOptions(configRecord);
        
        if (!this._validateOptions()) {
            result.errors.push("Invalid configuration options");
            return result;
        }

        var rulesMap = this._loadIssueRules(configRecord.verification_items || []);
        var ruleEval = new x_1310794_founda_0.FHARuleEvaluator();

        configRecord.verification_items.forEach(item => {
            try {
                // --- 1. Extract configuration parameters ---
                var tableName = item.tableName;
                var queryType = item.query_type.toLowerCase();
                var queryValue = item.query_value || '';
                var queryScript = item.query_script || '';
                
                // --- 2. Apply deep_scan option to fields ---
                var fields = this._determineFields(item);
                
                var category = item.category;

                // --- 3. Build the query based on type ---
                var gr = new GlideRecord(tableName);

                if (queryType === 'script') {
                    if (queryScript) {
                        var scriptResults = [];
                        var flowIds = scriptResults;
                        try {
                            eval(queryScript);
                        } catch (eScript) {
                            result.errors.push("Query script error: " + eScript.message);
                            gs.error("[FHAnalysisEngine] Query script error: " + eScript.message);
                        }
                        var ids = this._flattenIds(scriptResults);
                        if (ids.length > 0) {
                            gr.addQuery('sys_id', 'IN', ids.join(','));
                        } else {
                            result.success = true;
                            return result;
                        }
                    }
                } else {
                    gr.addEncodedQuery(queryValue.replaceAll("{0}", configRecord.table_name));
                }

                // ============================================================
                // NOUVEAU : Appliquer les options de configuration
                // ============================================================
                this._applyConfigurationOptions(gr, tableName);

                // --- 4. Execute query and process records ---
                gr.query();
                
                gs.info("[FHAnalysisEngine] Query executed for " + tableName + ": " + gr.getRowCount() + " records");

                while (gr.next()) {
                    var record = this._processRecord(gr, fields, item);
                    record._rules = rulesMap[item.sys_id] || [];
                    result.data.push(record);
                }

                // --- 5. Analyze results for issues (via FHARuleEvaluator) ---
                result = this._analyzeResults(result);
                result.success = true;

            } catch (e) {
                result.errors.push("Verification error: " + e.message);
                gs.error("[FHAnalysisEngine] Verification error: " + e.message + "\nStack: " + e.stack);
            }
        });
        
        return result;
    },

    // ============================================================
    // NOUVEAU : GESTION DES OPTIONS DE CONFIGURATION
    // ============================================================

    /**
     * Charge les options de configuration
     * @param {Object} configRecord - Configuration record
     * @returns {Object} - Options de configuration
     */
    _loadConfigurationOptions: function(configRecord) {
        var options = {
            ignore_servicenow_records: configRecord.ignore_servicenow_records || false,
            servicenow_users: configRecord.servicenow_users || 'system,admin,maint,guest',
            include_children_tables: configRecord.include_children_tables || false,
            deep_scan: configRecord.deep_scan || false,
            include_ldap: configRecord.include_ldap || true
        };
        
        gs.debug("[FHAnalysisEngine] Configuration options loaded: " + JSON.stringify(options));
        return options;
    },

    /**
     * Valide les options de configuration
     * @returns {Boolean} - true si les options sont valides
     */
    _validateOptions: function() {
        try {
            // Validation de servicenow_users
            if (this.options.ignore_servicenow_records && this.options.servicenow_users) {
                var users = this.options.servicenow_users.split(',');
                if (users.length === 0) {
                    gs.warn("[FHAnalysisEngine] servicenow_users is empty, using default");
                    this.options.servicenow_users = 'system,admin,maint,guest';
                }
            }
            
            // Validation des types boolean
            this.options.ignore_servicenow_records = Boolean(this.options.ignore_servicenow_records);
            this.options.include_children_tables = Boolean(this.options.include_children_tables);
            this.options.deep_scan = Boolean(this.options.deep_scan);
            this.options.include_ldap = Boolean(this.options.include_ldap);
            
            return true;
        } catch (e) {
            gs.error("[FHAnalysisEngine] Options validation error: " + e.message);
            return false;
        }
    },

    /**
     * Applique les options de configuration à la requête
     * @param {GlideRecord} gr - GlideRecord query
     * @param {String} tableName - Nom de la table
     */
    _applyConfigurationOptions: function(gr, tableName) {
        gs.debug("[FHAnalysisEngine] Applying configuration options for table: " + tableName);
        
        // Option 1: ignore_servicenow_records
        if (this.options.ignore_servicenow_records) {
            this._applyIgnoreServiceNowRecords(gr, tableName);
        }
        
        // Option 2: include_children_tables
        if (this.options.include_children_tables) {
            this._applyIncludeChildrenTables(gr, tableName);
        }
        
        // Option 3: include_ldap
        if (!this.options.include_ldap) {
            this._applyExcludeLDAP(gr, tableName);
        }
        
        // Option 4: deep_scan est géré dans _determineFields()
    },

    /**
     * Option 1: ignore_servicenow_records (Logique Intelligente)
     * Exclut les OOB purs, mais INCLUT les OOB modifiés
     */
    _applyIgnoreServiceNowRecords: function(gr, tableName) {
        try {
            // Parser la liste des utilisateurs ServiceNow
            var snUsersStr = this.options.servicenow_users || 'system,admin,maint,guest';
            var snUsers = snUsersStr.split(',').map(function(u) { return u.trim(); });
            
            gs.debug("[FHAnalysisEngine] Applying intelligent ServiceNow filter");
            gs.debug("[FHAnalysisEngine] ServiceNow users: " + snUsers.join(', '));
            
            // Vérifier si la table a les champs nécessaires
            var testGr = new GlideRecord(tableName);
            testGr.setLimit(1);
            testGr.query();
            
            if (testGr.next()) {
                var hasCreatedBy = testGr.isValidField('sys_created_by');
                var hasUpdatedBy = testGr.isValidField('sys_updated_by');
                var hasPackage = testGr.isValidField('sys_package');
                
                if (hasCreatedBy && hasUpdatedBy) {
                    // ============================================
                    // LOGIQUE INTELLIGENTE
                    // ============================================
                    // INCLURE si:
                    //   - Créé par custom user (sys_created_by NOT IN snUsers)
                    //   - OU modifié par custom user (sys_updated_by NOT IN snUsers)
                    // EXCLURE si:
                    //   - Créé ET modifié par users ServiceNow
                    
                    var notInCreated = 'sys_created_byNOT IN' + snUsers.join(',');
                    var notInUpdated = 'sys_updated_byNOT IN' + snUsers.join(',');
                    var encodedQuery = notInCreated + '^OR' + notInUpdated;
                    
                    gr.addEncodedQuery(encodedQuery);
                    
                    gs.info("[FHAnalysisEngine] ✅ Applied intelligent ServiceNow filter");
                    gs.info("[FHAnalysisEngine] → OOB pure records will be EXCLUDED");
                    gs.info("[FHAnalysisEngine] → OOB modified records will be INCLUDED");
                    
                } else if (hasPackage) {
                    // Fallback: filtre simple sur sys_package
                    gr.addEncodedQuery('sys_packageISNOTEMPTY^sys_package!=global');
                    gs.debug("[FHAnalysisEngine] Applied simple package filter (fallback)");
                    
                } else {
                    gs.warn("[FHAnalysisEngine] Cannot apply ignore_servicenow_records - required fields not found on table: " + tableName);
                }
            }
        } catch (e) {
            gs.error("[FHAnalysisEngine] Error applying ignore_servicenow_records: " + e.message);
        }
    },

    /**
     * Option 2: include_children_tables
     * Inclut les tables héritées dans l'analyse
     */
    _applyIncludeChildrenTables: function(gr, tableName) {
        try {
            // Vérifier si la table a le champ sys_class_name
            var testGr = new GlideRecord(tableName);
            testGr.setLimit(1);
            testGr.query();
            
            if (testGr.next() && testGr.isValidField('sys_class_name')) {
                // Inclure la table et toutes ses tables filles
                gr.addQuery('sys_class_name', 'STARTSWITH', tableName);
                
                gs.info("[FHAnalysisEngine] ✅ Applied include_children_tables filter");
                gs.info("[FHAnalysisEngine] → Will include records from child tables");
            } else {
                gs.debug("[FHAnalysisEngine] Table " + tableName + " does not support inheritance (no sys_class_name)");
            }
        } catch (e) {
            gs.error("[FHAnalysisEngine] Error applying include_children_tables: " + e.message);
        }
    },

    /**
     * Option 3: include_ldap (false = exclure LDAP)
     * Exclut les configurations LDAP de l'analyse
     */
    _applyExcludeLDAP: function(gr, tableName) {
        try {
            // Liste des tables LDAP à exclure
            var ldapTables = [
                'ldap_server_config',
                'ldap_ou_config',
                'ldap_group_map',
                'ldap_server'
            ];
            
            if (ldapTables.indexOf(tableName) !== -1) {
                // Cette table est une table LDAP, ne rien analyser
                gr.addQuery('sys_id', 'NULL');
                gs.info("[FHAnalysisEngine] ✅ Excluded LDAP table: " + tableName);
            }
            
            // Si la table a un champ lié à LDAP
            var testGr = new GlideRecord(tableName);
            testGr.setLimit(1);
            testGr.query();
            
            if (testGr.next()) {
                if (testGr.isValidField('ldap_server')) {
                    gr.addQuery('ldap_server', 'ISEMPTY');
                    gs.debug("[FHAnalysisEngine] Excluded LDAP-related records from " + tableName);
                }
            }
        } catch (e) {
            gs.error("[FHAnalysisEngine] Error applying exclude LDAP: " + e.message);
        }
    },

    /**
     * Option 4: deep_scan
     * Détermine les champs à analyser en fonction du mode deep_scan
     */
    _determineFields: function(item) {
        var fields = [];
        
        if (this.options.deep_scan) {
            // ============================================
            // MODE DEEP SCAN
            // ============================================
            // Inclure plus de champs pour une analyse approfondie
            fields = (item.fields && item.fields.split(',')) || [];
            
            // Ajouter des champs additionnels pour deep scan
            var deepScanFields = [
                'name', 'active', 'sys_created_by', 'sys_updated_by', 'sys_id',
                'sys_created_on', 'sys_updated_on', 'sys_mod_count',
                'sys_package', 'sys_scope', 'sys_class_name',
                'description', 'short_description', 'script', 'condition',
                'order', 'priority', 'when', 'filter_condition'
            ];
            
            deepScanFields.forEach(function(df) {
                if (fields.indexOf(df) === -1) {
                    fields.push(df);
                }
            });
            
            gs.debug("[FHAnalysisEngine] Deep scan enabled: " + fields.length + " fields");
            
        } else {
            // ============================================
            // MODE NORMAL
            // ============================================
            fields = (item.fields && item.fields.split(',')) || [];
            
            // Ajouter uniquement les champs essentiels
            var defaults = ['name', 'active', 'sys_created_by', 'sys_updated_by', 'sys_id'];
            defaults.forEach(function(df) {
                if (fields.indexOf(df) === -1) {
                    fields.push(df);
                }
            });
        }
        
        // Nettoyer les champs
        fields = fields.map(function(f) {
            return (f || '').trim();
        }).filter(function(f) {
            return !!f;
        });
        
        return fields;
    },

    // ============================================================
    // MÉTHODES EXISTANTES (inchangées)
    // ============================================================

    /**
     * Processes a single record to extract relevant data
     * @param {GlideRecord} gr - Current record
     * @param {Array} fields - Fields to extract
     * @returns {Object} - Processed record with values and empty issues array
     */
    _processRecord: function(gr, fields, item) {
        var record = {
            sys_id: gr.sys_id.toString(),
            table: gr.getTableName(),
            values: {},
            issues: [],
            category: item.category
        };

        // Extract requested fields
        fields.forEach(function(field) {
            if (gr.isValidField(field)) {
                record.values[field] = gr.getValue(field);
            }
        });
        
        return record;
    },

    /**
     * Analyzes records to detect issues (e.g., inactive Flows, stale records)
     * @param {Object} result - Current result object
     * @returns {Object} - Updated result with issues
     */
    _analyzeResults: function(result) {
        try {
            // context for aggregate-aware rules
            var context = {
                totalCount: result.data.length,
                _dupsSeen: {},
                options: this.options // Passer les options au contexte
            };
            
            result.data.forEach(function(it) {
                var key = (it.values.name || '') + '|' + (it.values.code || '');
                if (!context._dupsSeen[key]) context._dupsSeen[key] = it.sys_id;
            });

            var ruleEval = new x_1310794_founda_0.FHARuleEvaluator();
            var aggregatedIssues = [];

            result.data.forEach(function(item) {
                var rules = item._rules || [];
                item.issues = ruleEval.evaluate(item, rules, context) || [];

                // Aggregate issues at result level for portal/widget
                (item.issues || []).forEach(function(is) {
                    var issueDetails = is.details || {};
                    aggregatedIssues.push({
                        code: is.code || '',
                        message: is.message || '',
                        severity: is.severity || 'medium',
                        record_table: issueDetails.record_table || item.table || '',
                        record_sys_id: issueDetails.record_sys_id || item.sys_id || '',
                        record_name: issueDetails.record_name || (item.values && item.values.name) || '',
                        record_filter: issueDetails.record_filter || '',
                        category: item.category || '',
                        details: issueDetails
                    });
                });
            });

            result.issues = aggregatedIssues;

        } catch (error) {
            gs.error("[FHAnalysisEngine] _analyzeResults: " + error.message);
        }
        return result;
    },

    _flattenIds: function(list) {
        var ids = [];
        if (!list) return ids;
        var pushId = function(v) {
            if (!v) return;
            if (typeof v === 'string') {
                if (v.indexOf(',') > -1) {
                    v.split(',').forEach(pushId);
                } else {
                    ids.push(v);
                }
            } else if (Array.isArray(v)) {
                v.forEach(pushId);
            } else if (v.sys_id) {
                ids.push(String(v.sys_id));
            } else if (v.getUniqueValue && typeof v.getUniqueValue === 'function') {
                ids.push(String(v.getUniqueValue()));
            }
        };
        pushId(list);
        return ids;
    },

    _loadIssueRules: function(items) {
        var map = {};
        var ids = [];
        (items || []).forEach(function(it) {
            if (it.issue_rules) {
                ids = ids.concat(String(it.issue_rules).split(','));
            }
        });
        ids = ids.filter(function(x) {
            return x;
        });
        if (!ids.length) return map;

        var gr = new GlideRecord('x_1310794_founda_0_issue_rules');
        gr.addQuery('sys_id', 'IN', ids.join(','));
        gr.addQuery('active', true);
        gr.query();
        while (gr.next()) {
            var rule = {
                sys_id: gr.getUniqueValue(),
                name: gr.getValue('name') || '',
                code: gr.getValue('code') || '',
                type: gr.getValue('type') || '',
                default_severity: gr.getValue('default_severity') || 'medium',
                params: gr.getValue('params') || '{}',
                script: gr.getValue('script') || ''
            };
            // attach by each item that referenced it
            (items || []).forEach(function(it) {
                if (String(it.issue_rules || '').indexOf(rule.sys_id) > -1) {
                    if (!map[it.sys_id]) map[it.sys_id] = [];
                    map[it.sys_id].push(rule);
                }
            });
        }
        return map;
    },

    type: 'FHAnalysisEngine'
};
