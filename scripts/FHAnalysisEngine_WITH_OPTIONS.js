/**
 * FHAnalysisEngine - CORRECTED VERSION WITH OPTIONS IMPLEMENTATION
 * This version properly implements all configuration options:
 * - ignore_servicenow_records
 * - include_children_tables  
 * - deep_scan
 * - include_ldap
 */

var FHAnalysisEngine = Class.create();
FHAnalysisEngine.prototype = {
    initialize: function() {
        // Initialize if needed
    },

    /**
     * Executes verification for a configured item
     * @param {Object} configRecord - Configuration record with options
     * @returns {Object} - Verification result
     */
    runVerification: function(configRecord) {
        var result = {
            success: false,
            data: [],
            errors: [],
            metadata: {},
        };

        var rulesMap = this._loadIssueRules(configRecord.verification_items || []);
        var ruleEval = new x_1310794_founda_0.FHARuleEvaluator();

        configRecord.verification_items.forEach(item => {
            try {
                // --- 1. Extract configuration parameters ---
                var tableName = item.tableName;
                var queryType = item.query_type.toLowerCase();
                var queryValue = item.query_value || '';
                var queryScript = item.query_script || '';
                var fields = (item.fields && item.fields.split(',')) || [];
                
                // --- MODIFICATION: Extend fields if deep_scan is enabled ---
                fields = this._prepareFields(fields, configRecord.deep_scan);
                
                var category = item.category;

                // --- 2. Get tables to analyze (parent + children if enabled) ---
                var tablesToAnalyze = this._getTablesToAnalyze(tableName, configRecord.include_children_tables);

                // --- 3. Process each table ---
                tablesToAnalyze.forEach(function(currentTable) {
                    
                    // --- 4. Build the query based on type ---
                    var gr = new GlideRecord(currentTable);

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
                                return;
                            }
                        }
                    } else {
                        // Apply encoded query
                        gr.addEncodedQuery(queryValue.replaceAll("{0}", configRecord.table_name));
                    }

                    // --- MODIFICATION: Apply ignore_servicenow_records filter ---
                    if (configRecord.ignore_servicenow_records) {
                        this._applyServiceNowFilter(gr, currentTable);
                    }

                    // --- MODIFICATION: Apply include_ldap filter ---
                    if (!configRecord.include_ldap) {
                        this._applyLDAPFilter(gr, currentTable);
                    }

                    // --- 5. Execute query and process records ---
                    gr.query();

                    while (gr.next()) {
                        var record = this._processRecord(gr, fields, item);
                        record._rules = rulesMap[item.sys_id] || [];
                        result.data.push(record);
                    }
                    
                }.bind(this));

                // --- 6. Analyze results for issues ---
                result = this._analyzeResults(result, configRecord);
                result.success = true;

            } catch (e) {
                result.errors.push("Verification error: " + e.message);
                gs.error("[FHAnalysisEngine] Verification error: " + e.message + "\nStack: " + e.stack);
            }
        });
        
        return result;
    },

    /**
     * Prepare fields list based on deep_scan option
     * @param {Array} fields - Base fields
     * @param {Boolean} deepScan - Deep scan enabled
     * @returns {Array} - Extended fields
     */
    _prepareFields: function(fields, deepScan) {
        // Clean and filter fields
        fields = fields.map(function(f) {
            return (f || '').trim();
        }).filter(function(f) {
            return !!f;
        });

        // Add default fields
        var defaults = ['name', 'active', 'sys_created_by', 'sys_updated_by', 'sys_id'];
        defaults.forEach(function(df) {
            if (fields.indexOf(df) === -1) fields.push(df);
        });

        // If deep_scan is enabled, add extra fields for better analysis
        if (deepScan) {
            var extraFields = [
                'sys_created_on',
                'sys_updated_on',
                'sys_mod_count',
                'sys_package',
                'sys_scope',
                'sys_class_name'
            ];
            extraFields.forEach(function(ef) {
                if (fields.indexOf(ef) === -1) {
                    fields.push(ef);
                }
            });
            
            gs.debug("[FHAnalysisEngine] Deep scan enabled - Extended fields: " + fields.join(', '));
        }

        return fields;
    },

    /**
     * Get tables to analyze (parent + children if enabled)
     * @param {String} parentTable - Parent table name
     * @param {Boolean} includeChildren - Include child tables
     * @returns {Array} - Array of table names
     */
    _getTablesToAnalyze: function(parentTable, includeChildren) {
        var tables = [parentTable];

        if (includeChildren) {
            var childTables = this._getChildTables(parentTable);
            if (childTables.length > 0) {
                tables = tables.concat(childTables);
                gs.info("[FHAnalysisEngine] Including child tables: " + childTables.join(', '));
            }
        }

        return tables;
    },

    /**
     * Get child tables of a parent table
     * @param {String} parentTable - Parent table name
     * @returns {Array} - Array of child table names
     */
    _getChildTables: function(parentTable) {
        var children = [];
        
        try {
            var gr = new GlideRecord('sys_db_object');
            gr.addQuery('super_class.name', parentTable);
            gr.query();
            
            while (gr.next()) {
                var tableName = gr.getValue('name');
                if (tableName && tableName !== parentTable) {
                    children.push(tableName);
                }
            }
            
            gs.debug("[FHAnalysisEngine] Found " + children.length + " child tables for " + parentTable);
        } catch (e) {
            gs.error("[FHAnalysisEngine] Error getting child tables: " + e.message);
        }

        return children;
    },

    /**
     * Apply filter to ignore ServiceNow out-of-box records
     * @param {GlideRecord} gr - GlideRecord to filter
     * @param {String} tableName - Table name
     */
    _applyServiceNowFilter: function(gr, tableName) {
        try {
            // Check if table has sys_package field
            if (this._tableHasField(tableName, 'sys_package')) {
                // Exclude global package and empty package
                gr.addEncodedQuery('sys_packageISNOTEMPTY^sys_package!=global');
                gs.debug("[FHAnalysisEngine] Applied ServiceNow filter on sys_package");
            }
            // Alternative: Check sys_scope
            else if (this._tableHasField(tableName, 'sys_scope')) {
                gr.addEncodedQuery('sys_scopeISNOTEMPTY^sys_scope!=global');
                gs.debug("[FHAnalysisEngine] Applied ServiceNow filter on sys_scope");
            }
        } catch (e) {
            gs.warn("[FHAnalysisEngine] Could not apply ServiceNow filter: " + e.message);
        }
    },

    /**
     * Apply filter to exclude LDAP records if include_ldap is false
     * @param {GlideRecord} gr - GlideRecord to filter
     * @param {String} tableName - Table name
     */
    _applyLDAPFilter: function(gr, tableName) {
        try {
            // Filter LDAP records based on table
            if (tableName === 'sys_user' && this._tableHasField(tableName, 'ldap_server')) {
                gr.addQuery('ldap_server', '');
                gs.debug("[FHAnalysisEngine] Applied LDAP filter on sys_user");
            }
            else if (tableName === 'sys_user' && this._tableHasField(tableName, 'source')) {
                gr.addQuery('source', '!=', 'ldap');
                gs.debug("[FHAnalysisEngine] Applied LDAP filter on source");
            }
            // Add more LDAP-specific filters if needed
        } catch (e) {
            gs.warn("[FHAnalysisEngine] Could not apply LDAP filter: " + e.message);
        }
    },

    /**
     * Check if a table has a specific field
     * @param {String} tableName - Table name
     * @param {String} fieldName - Field name
     * @returns {Boolean} - True if field exists
     */
    _tableHasField: function(tableName, fieldName) {
        try {
            var gr = new GlideRecord(tableName);
            gr.setLimit(1);
            gr.query();
            if (gr.next()) {
                return gr.isValidField(fieldName);
            }
        } catch (e) {
            return false;
        }
        return false;
    },

    /**
     * Processes a single record to extract relevant data
     * @param {GlideRecord} gr - Current record
     * @param {Array} fields - Fields to extract
     * @param {Object} item - Verification item
     * @returns {Object} - Processed record
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
            record.values[field] = gr.getValue(field);
        });
        
        return record;
    },

    /**
     * Analyzes records to detect issues
     * @param {Object} result - Current result object
     * @param {Object} configRecord - Configuration with options
     * @returns {Object} - Updated result with issues
     */
    _analyzeResults: function(result, configRecord) {
        try {
            // Context for aggregate-aware rules
            var context = {
                totalCount: result.data.length,
                _dupsSeen: {},
                // Add deep_scan info to context
                deep_scan: configRecord.deep_scan || false
            };
            
            // Build duplicate detection map
            result.data.forEach(function(it) {
                var key = (it.values.name || '') + '|' + (it.values.code || '');
                if (!context._dupsSeen[key]) context._dupsSeen[key] = it.sys_id;
            });

            var ruleEval = new x_1310794_founda_0.FHARuleEvaluator();
            var aggregatedIssues = [];

            // Evaluate rules for each item
            result.data.forEach(function(item) {
                var rules = item._rules || [];
                item.issues = ruleEval.evaluate(item, rules, context) || [];

                // Aggregate issues at result level
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

            // Log summary if deep_scan
            if (configRecord.deep_scan) {
                gs.info("[FHAnalysisEngine] Deep scan complete - Found " + aggregatedIssues.length + " issues in " + result.data.length + " records");
            }

        } catch (error) {
            gs.error("[FHAnalysisEngine] _analyzeResults: " + error.message);
        }
        
        return result;
    },

    /**
     * Flatten IDs from various formats
     * @param {*} list - List of IDs in various formats
     * @returns {Array} - Flattened array of IDs
     */
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

    /**
     * Load issue rules for verification items
     * @param {Array} items - Verification items
     * @returns {Object} - Map of rules by item sys_id
     */
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
                severity: gr.getValue('severity') || 'medium',
                params: gr.getValue('params') || '{}',
                script: gr.getValue('script') || ''
            };
            
            // Attach rule to each item that referenced it
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
