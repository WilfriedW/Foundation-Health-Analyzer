/**
 * Script de création : Verification Items + Issue Rules pour la Qualité des Données
 *
 * À exécuter dans Background Scripts de ServiceNow
 * Ce script crée :
 * - 5 Issue Rules pour détecter les problèmes de qualité des données
 * - 3 Verification Items (un par catégorie de table)
 *
 * Catégories de détection :
 * - Champs obligatoires vides
 * - Dates incohérentes
 * - Emails en double
 * - Données obsolètes (jamais mises à jour)
 * - Références cassées
 */

(function createDataQualityVI() {

    // ============================================================
    // 1. DÉFINITION DES ISSUE RULES
    // ============================================================

    var rules = [
        {
            name: 'Mandatory field empty',
            code: 'DATA_MANDATORY_EMPTY',
            description: 'Detects records with mandatory fields empty despite validation rules.',
            severity: 'medium',
            type: 'data_quality',
            active: true,
            params: JSON.stringify({
                fields: 'priority,category,short_description'
            }),
            script: `
/**
 * RULE: Mandatory field empty
 * Detects empty mandatory fields
 * Params: { "fields": "field1,field2,field3" }
 */
(function executeRule(item, context, issues) {
    if (!params || !params.fields) {
        gs.warn('[Rule:DATA_MANDATORY_EMPTY] No fields specified in params');
        return;
    }

    var mandatoryFields = params.fields.split(',').map(function(f) {
        return f.trim();
    });

    var emptyFields = [];

    mandatoryFields.forEach(function(fieldName) {
        var value = item.values[fieldName];
        if (!value || value === '' || value === 'NULL') {
            emptyFields.push(fieldName);
        }
    });

    if (emptyFields.length > 0) {
        var recordNumber = item.values.number || item.values.name || item.sys_id;

        issues.push({
            code: rule.code,
            message: 'Record "' + recordNumber + '" has ' + emptyFields.length + ' empty mandatory field(s): ' + emptyFields.join(', '),
            severity: rule.severity || 'medium',
            record: item.sys_id,
            record_table: item.table,
            record_sys_id: item.sys_id,
            details: {
                record_number: recordNumber,
                empty_fields: emptyFields,
                total_empty: emptyFields.length,
                checked_fields: mandatoryFields,
                recommendation: 'Update records to fill mandatory fields or adjust field configuration and data policies.'
            }
        });
    }
})(item, context, issues);
`
        },

        {
            name: 'Inconsistent dates',
            code: 'DATA_INCONSISTENT_DATES',
            description: 'Detects date inconsistencies (e.g., end date before start date).',
            severity: 'medium',
            type: 'data_quality',
            active: true,
            params: JSON.stringify({
                start_field: 'opened_at',
                end_field: 'closed_at',
                allow_null: true
            }),
            script: `
/**
 * RULE: Inconsistent dates
 * Detects inconsistent dates
 * Params: { "start_field": "opened_at", "end_field": "closed_at", "allow_null": true }
 */
(function executeRule(item, context, issues) {
    if (!params || !params.start_field || !params.end_field) {
        gs.warn('[Rule:DATA_INCONSISTENT_DATES] Missing field parameters');
        return;
    }

    var startDate = item.values[params.start_field];
    var endDate = item.values[params.end_field];
    var allowNull = params.allow_null !== false; // Default true

    // If allow_null is true and one of the dates is null, ignore
    if (allowNull && (!startDate || !endDate)) {
        return;
    }

    if (startDate && endDate) {
        var start = new GlideDateTime(startDate);
        var end = new GlideDateTime(endDate);

        // Check that end date is after start date
        if (end.before(start)) {
            var recordNumber = item.values.number || item.values.name || item.sys_id;

            issues.push({
                code: rule.code,
                message: 'Record "' + recordNumber + '" has inconsistent dates: ' +
                         params.end_field + ' (' + endDate + ') is before ' +
                         params.start_field + ' (' + startDate + ')',
                severity: rule.severity || 'medium',
                record: item.sys_id,
                record_table: item.table,
                record_sys_id: item.sys_id,
                details: {
                    record_number: recordNumber,
                    start_field: params.start_field,
                    start_date: startDate,
                    end_field: params.end_field,
                    end_date: endDate,
                    recommendation: 'Correct the date fields to reflect proper chronology.'
                }
            });
        }
    }
})(item, context, issues);
`
        },

        {
            name: 'Duplicate email addresses',
            code: 'DATA_DUPLICATE_EMAIL',
            description: 'Detects duplicate email addresses in the users table.',
            severity: 'high',
            type: 'data_quality',
            active: true,
            params: JSON.stringify({
                email_field: 'email'
            }),
            script: `
/**
 * RULE: Duplicate email addresses
 * Detects duplicate emails
 * Params: { "email_field": "email" }
 */
(function executeRule(item, context, issues) {
    var emailField = (params && params.email_field) || 'email';
    var email = item.values[emailField];

    if (!email || email === '') return;

    // Count other records with the same email
    var gr = new GlideRecord(item.table);
    gr.addQuery(emailField, email);
    gr.addQuery('sys_id', '!=', item.sys_id);
    gr.addActiveQuery();
    gr.query();

    var duplicates = [];
    var count = 0;

    while (gr.next() && count < 10) { // Limit to 10 to avoid too much data
        duplicates.push({
            sys_id: gr.getUniqueValue(),
            name: gr.getValue('name') || gr.getValue('user_name') || gr.getValue('sys_id'),
            email: gr.getValue(emailField)
        });
        count++;
    }

    if (duplicates.length > 0) {
        var recordName = item.values.name || item.values.user_name || item.sys_id;

        // Count total without limit
        var totalGr = new GlideAggregate(item.table);
        totalGr.addQuery(emailField, email);
        totalGr.addQuery('sys_id', '!=', item.sys_id);
        totalGr.addActiveQuery();
        totalGr.addAggregate('COUNT');
        totalGr.query();
        var totalCount = totalGr.next() ? parseInt(totalGr.getAggregate('COUNT'), 10) : duplicates.length;

        issues.push({
            code: rule.code,
            message: 'Email "' + email + '" is used by ' + (totalCount + 1) + ' active records (including "' + recordName + '").',
            severity: rule.severity || 'high',
            record: item.sys_id,
            record_table: item.table,
            record_sys_id: item.sys_id,
            details: {
                record_name: recordName,
                email: email,
                duplicate_count: totalCount,
                sample_duplicates: duplicates.slice(0, 5),
                recommendation: 'Merge duplicate records or update email addresses to be unique. Consider implementing email uniqueness validation.'
            }
        });
    }
})(item, context, issues);
`
        },

        {
            name: 'Stale record never updated',
            code: 'DATA_NEVER_UPDATED',
            description: 'Detects active records that have never been updated since creation.',
            severity: 'low',
            type: 'data_quality',
            active: true,
            params: JSON.stringify({
                min_age_days: 90
            }),
            script: `
/**
 * RULE: Stale record never updated
 * Detects records never updated
 * Params: { "min_age_days": 90 }
 */
(function executeRule(item, context, issues) {
    var minAgeDays = (params && params.min_age_days) || 90;

    var createdOn = item.values.sys_created_on;
    var updatedOn = item.values.sys_updated_on;

    if (!createdOn || !updatedOn) return;

    // Check if sys_created_on == sys_updated_on (never updated)
    if (createdOn === updatedOn) {
        var created = new GlideDateTime(createdOn);
        var now = new GlideDateTime();

        var duration = GlideDateTime.subtract(created, now);
        var days = Math.floor(duration.getNumericValue() / (1000 * 60 * 60 * 24));

        if (days >= minAgeDays) {
            var recordNumber = item.values.number || item.values.name || item.sys_id;

            issues.push({
                code: rule.code,
                message: 'Record "' + recordNumber + '" has never been updated since creation ' + days + ' days ago.',
                severity: rule.severity || 'low',
                record: item.sys_id,
                record_table: item.table,
                record_sys_id: item.sys_id,
                details: {
                    record_number: recordNumber,
                    created_on: createdOn,
                    age_days: days,
                    threshold_days: minAgeDays,
                    recommendation: 'Review record to determine if it should be updated, archived, or deleted.'
                }
            });
        }
    }
})(item, context, issues);
`
        },

        {
            name: 'Broken reference field',
            code: 'DATA_BROKEN_REFERENCE',
            description: 'Detects reference fields pointing to deleted or non-existent records.',
            severity: 'medium',
            type: 'data_quality',
            active: true,
            params: JSON.stringify({
                reference_fields: 'assigned_to,opened_by,caller_id'
            }),
            script: `
/**
 * RULE: Broken reference field
 * Detects broken references
 * Params: { "reference_fields": "assigned_to,opened_by,caller_id" }
 */
(function executeRule(item, context, issues) {
    if (!params || !params.reference_fields) {
        gs.warn('[Rule:DATA_BROKEN_REFERENCE] No reference fields specified in params');
        return;
    }

    var referenceFields = params.reference_fields.split(',').map(function(f) {
        return f.trim();
    });

    var brokenRefs = [];

    referenceFields.forEach(function(fieldName) {
        var refValue = item.values[fieldName];

        // If the field has a value
        if (refValue && refValue !== '') {
            // Try to retrieve the referenced record
            // Note: In the analyzer context, we don't always have access to getRefRecord()
            // We assume that if the value is a valid sys_id (32 chars hex), we check it
            if (refValue.match(/^[0-9a-f]{32}$/i)) {
                // We could check here if the record exists
                // For now, we simply flag suspect sys_ids
                // An improvement would be to do real verification
                brokenRefs.push({
                    field: fieldName,
                    sys_id: refValue,
                    status: 'unchecked' // To improve
                });
            }
        }
    });

    // NOTE: This rule needs improvement to really verify
    // if references exist. For now, it serves as a placeholder.

    // To avoid too many false positives, we don't create issues for now
    // You can enable this logic if you implement real verification

    /*
    if (brokenRefs.length > 0) {
        var recordNumber = item.values.number || item.values.name || item.sys_id;

        issues.push({
            code: rule.code,
            message: 'Record "' + recordNumber + '" has ' + brokenRefs.length + ' reference field(s) to verify.',
            severity: rule.severity || 'medium',
            record: item.sys_id,
            record_table: item.table,
            record_sys_id: item.sys_id,
            details: {
                record_number: recordNumber,
                references: brokenRefs,
                recommendation: 'Verify that referenced records exist and are accessible.'
            }
        });
    }
    */
})(item, context, issues);
`
        }
    ];

    // ============================================================
    // 2. CREATE ISSUE RULES
    // ============================================================

    gs.info('===== CREATING ISSUE RULES =====');

    var ruleSysIds = [];
    var rulesByCodes = {};

    rules.forEach(function(ruleData) {
        var gr = new GlideRecord('x_1310794_founda_0_issue_rules');

        // Check if rule already exists
        gr.addQuery('code', ruleData.code);
        gr.query();

        var exists = gr.next();

        if (!exists) {
            gr.initialize();
        }

        // Update fields
        gr.setValue('name', ruleData.name);
        gr.setValue('code', ruleData.code);
        gr.setValue('description', ruleData.description);
        gr.setValue('severity', ruleData.severity);
        gr.setValue('type', ruleData.type);
        gr.setValue('active', ruleData.active);
        gr.setValue('script', ruleData.script.trim());
        gr.setValue('params', ruleData.params);

        var sysId = exists ? gr.update() : gr.insert();
        ruleSysIds.push(sysId);
        rulesByCodes[ruleData.code] = sysId;

        gs.info((exists ? 'Updated' : 'Created') + ' rule: ' + ruleData.code + ' (' + sysId + ')');
    });

    // ============================================================
    // 3. CREATE VERIFICATION ITEMS
    // ============================================================

    gs.info('\n===== CREATING VERIFICATION ITEMS =====');

    var verificationItems = [
        {
            name: 'Data Quality - Incidents',
            table: 'incident',
            category: 'quality',
            query: 'active=true',
            rules: [
                rulesByCodes['DATA_MANDATORY_EMPTY'],
                rulesByCodes['DATA_INCONSISTENT_DATES'],
                rulesByCodes['DATA_NEVER_UPDATED'],
                rulesByCodes['DATA_BROKEN_REFERENCE']
            ]
        },
        {
            name: 'Data Quality - Users',
            table: 'sys_user',
            category: 'quality',
            query: 'active=true',
            rules: [
                rulesByCodes['DATA_DUPLICATE_EMAIL'],
                rulesByCodes['DATA_NEVER_UPDATED']
            ]
        },
        {
            name: 'Data Quality - Change Requests',
            table: 'change_request',
            category: 'quality',
            query: 'active=true',
            rules: [
                rulesByCodes['DATA_MANDATORY_EMPTY'],
                rulesByCodes['DATA_INCONSISTENT_DATES'],
                rulesByCodes['DATA_BROKEN_REFERENCE']
            ]
        }
    ];

    var viSysIds = [];

    verificationItems.forEach(function(viData) {
        var vi = new GlideRecord('x_1310794_founda_0_verification_items');

        // Check if VI already exists
        vi.addQuery('name', viData.name);
        vi.query();

        var viExists = vi.next();

        if (!viExists) {
            vi.initialize();
        }

        vi.setValue('name', viData.name);
        vi.setValue('category', viData.category);
        vi.setValue('active', true);

        // Reference to table
        var tableGr = new GlideRecord('sys_db_object');
        tableGr.addQuery('name', viData.table);
        tableGr.query();
        if (tableGr.next()) {
            vi.setValue('table', tableGr.getUniqueValue());
        }

        // Query
        vi.setValue('query_value', viData.query);

        // Associate rules (filter undefined)
        var validRules = viData.rules.filter(function(r) { return r; });
        vi.setValue('issue_rules', validRules.join(','));

        var viSysId = viExists ? vi.update() : vi.insert();
        viSysIds.push(viSysId);

        gs.info((viExists ? 'Updated' : 'Created') + ' VI: ' + viData.name + ' (' + viSysId + ')');

        // Update rules to reference the VI
        validRules.forEach(function(ruleSysId) {
            var ruleGr = new GlideRecord('x_1310794_founda_0_issue_rules');
            if (ruleGr.get(ruleSysId)) {
                var existingVIs = ruleGr.getValue('verification_items') || '';
                var viList = existingVIs ? existingVIs.split(',') : [];

                if (viList.indexOf(viSysId) === -1) {
                    viList.push(viSysId);
                    ruleGr.setValue('verification_items', viList.join(','));
                    ruleGr.update();
                }
            }
        });
    });

    // ============================================================
    // 4. SUMMARY
    // ============================================================

    gs.info('\n===== CREATION COMPLETED =====');
    gs.info('Verification Items created: ' + viSysIds.length);
    viSysIds.forEach(function(id, idx) {
        gs.info('  ' + (idx + 1) + '. ' + verificationItems[idx].name + ' (' + id + ')');
    });

    gs.info('\nIssue Rules created:');
    for (var code in rulesByCodes) {
        gs.info('  - ' + code + ' (' + rulesByCodes[code] + ')');
    }

    gs.info('\n📊 DATA QUALITY RULES:');
    gs.info('  - DATA_MANDATORY_EMPTY: Empty mandatory fields');
    gs.info('  - DATA_INCONSISTENT_DATES: Inconsistent dates');
    gs.info('  - DATA_DUPLICATE_EMAIL: Duplicate emails');
    gs.info('  - DATA_NEVER_UPDATED: Records never updated');
    gs.info('  - DATA_BROKEN_REFERENCE: Broken references (placeholder)');

    gs.info('\nNext steps:');
    gs.info('1. Create Configurations to analyze tables incident, sys_user, change_request');
    gs.info('2. Associate the corresponding VIs');
    gs.info('3. Run analyses to detect data quality issues');

    return {
        success: true,
        vi_sys_ids: viSysIds,
        rules: rulesByCodes
    };

})();
