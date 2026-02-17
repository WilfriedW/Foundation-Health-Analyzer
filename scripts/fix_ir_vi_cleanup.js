// =============================================================================
// Foundation Health Analyzer — Issue Rules & Verification Items Cleanup Script
// =============================================================================
// PURPOSE:  Fix all broken Issue Rule scripts, deactivate unusable rules,
//           correct execution_mode, deduplicate VIs, and set VI associations.
// TARGET:   ServiceNow "Scripts - Background"
// DATE:     2026-02-16
// TABLES:   x_1310794_founda_0_issue_rules, x_1310794_founda_0_verification_items
//
// HOW TO RUN:
//   1. Navigate to: System Definition > Scripts - Background
//   2. Paste this entire script
//   3. Click "Run script"
//   4. Review the output log for results
//
// SAFETY:
//   - This script only updates records; it does not delete anything.
//   - Deactivation sets active=false (records remain in the table).
//   - All changes are logged via gs.info() / gs.warn().
// =============================================================================

var IR_TABLE = 'x_1310794_founda_0_issue_rules';
var VI_TABLE = 'x_1310794_founda_0_verification_items';

// Counters for the summary
var counters = {
    deactivatedIRs: 0,
    fixedExecutionMode: 0,
    fixedScripts: 0,
    deactivatedVIs: 0,
    updatedVIAssociations: 0,
    errors: 0
};

// ---------------------------------------------------------------------------
// Helper: Update an Issue Rule record
// ---------------------------------------------------------------------------
function updateRule(sysId, fieldUpdates) {
    var gr = new GlideRecord(IR_TABLE);
    if (gr.get(sysId)) {
        for (var key in fieldUpdates) {
            if (fieldUpdates.hasOwnProperty(key)) {
                gr.setValue(key, fieldUpdates[key]);
            }
        }
        gr.update();
        gs.info('[IR-CLEANUP] Updated rule: ' + gr.getValue('code') + ' (' + sysId + ')');
        return true;
    }
    gs.warn('[IR-CLEANUP] Rule NOT FOUND: ' + sysId);
    counters.errors++;
    return false;
}

// ---------------------------------------------------------------------------
// Helper: Update a rule's script field (and optionally other fields)
// ---------------------------------------------------------------------------
function updateRuleScript(sysId, newScript, extraUpdates) {
    var gr = new GlideRecord(IR_TABLE);
    if (gr.get(sysId)) {
        gr.setValue('script', newScript);
        if (extraUpdates) {
            for (var key in extraUpdates) {
                if (extraUpdates.hasOwnProperty(key)) {
                    gr.setValue(key, extraUpdates[key]);
                }
            }
        }
        gr.update();
        gs.info('[IR-CLEANUP] Updated script for rule: ' + gr.getValue('code') + ' (' + sysId + ')');
        counters.fixedScripts++;
        return true;
    }
    gs.warn('[IR-CLEANUP] Rule NOT FOUND for script update: ' + sysId);
    counters.errors++;
    return false;
}

// ---------------------------------------------------------------------------
// Helper: Deactivate a record on any table
// ---------------------------------------------------------------------------
function deactivateRecord(table, sysId, label) {
    var gr = new GlideRecord(table);
    if (gr.get(sysId)) {
        gr.setValue('active', 'false');
        gr.update();
        gs.info('[IR-CLEANUP] Deactivated ' + label + ': ' + (gr.getValue('code') || gr.getValue('name') || sysId));
        return true;
    }
    gs.warn('[IR-CLEANUP] Record NOT FOUND for deactivation: ' + table + ' / ' + sysId);
    counters.errors++;
    return false;
}


// =============================================================================
// PART 1: Deactivate broken / unusable Issue Rules
// =============================================================================
gs.info('');
gs.info('================================================================');
gs.info('[IR-CLEANUP] PART 1: Deactivating broken/unusable Issue Rules');
gs.info('================================================================');

var rulesToDeactivate = [
    { sysId: 'f2a413f853a2be10c7233ee0a0490e9f', code: 'integration_error',  reason: 'Checks non-existent field item.values.integration_error' },
    { sysId: 'f6a413f853a2be10c7233ee0a0490ea2', code: 'script_weight',      reason: 'Checks non-existent field item.values.heavy_script' },
    { sysId: 'fea413f853a2be10c7233ee0a0490e9b', code: 'job_inactive',        reason: 'Checks non-existent field item.values.job_inactive' },
    { sysId: 'fea413f853a2be10c7233ee0a0490e8e', code: 'acl_issue',           reason: 'Checks non-existent field item.values.acl_too_wide' },
    { sysId: 'faa413f853a2be10c7233ee0a0490ee4', code: 'observability',       reason: 'Checks non-existent field item.values.no_metrics' },
    { sysId: 'b2a413f853a2be10c7233ee0a0490e9b', code: 'job_error',           reason: 'Checks non-existent field item.values.job_error' },
    { sysId: 'f261a3a953623650c7233ee0a0490e29', code: 'IMPORT_SET_STALE',    reason: 'Broken beyond repair with current data model' }
];

for (var d = 0; d < rulesToDeactivate.length; d++) {
    var ruleInfo = rulesToDeactivate[d];
    gs.info('[IR-CLEANUP]   Deactivating "' + ruleInfo.code + '" — ' + ruleInfo.reason);
    if (deactivateRecord(IR_TABLE, ruleInfo.sysId, 'IR')) {
        counters.deactivatedIRs++;
    }
}


// =============================================================================
// PART 2: Fix execution_mode for aggregate rules
// =============================================================================
gs.info('');
gs.info('================================================================');
gs.info('[IR-CLEANUP] PART 2: Fixing execution_mode for aggregate rules');
gs.info('================================================================');

var aggregateRules = [
    { sysId: 'f2a413f853a2be10c7233ee0a0490e92', code: 'br_density' },
    { sysId: 'f6a413f853a2be10c7233ee0a0490e95', code: 'aggregate_metric' },
    { sysId: 'b27a5ba953223650c7233ee0a0490e80', code: 'UPDATE_SET_TOO_LARGE' }
];

for (var a = 0; a < aggregateRules.length; a++) {
    var aggRule = aggregateRules[a];
    gs.info('[IR-CLEANUP]   Setting execution_mode=aggregate on "' + aggRule.code + '"');
    if (updateRule(aggRule.sysId, { execution_mode: 'aggregate' })) {
        counters.fixedExecutionMode++;
    }
}


// =============================================================================
// PART 3: Fix ALL remaining active rule scripts
// =============================================================================
gs.info('');
gs.info('================================================================');
gs.info('[IR-CLEANUP] PART 3: Fixing scripts on broken Issue Rules');
gs.info('================================================================');

// ---- 3.1  USER_NO_DEPARTMENT (0752df6953eef250c7233ee0a0490e5d) ----
gs.info('[IR-CLEANUP]   Fixing USER_NO_DEPARTMENT...');
var script_USER_NO_DEPARTMENT =
'(function executeRule() {\n' +
'    var excludedUsers = [\'admin\', \'system\', \'guest\', \'itil\', \'service_desk\'];\n' +
'    var userName = (item.values.user_name || item.values.name || \'\').toLowerCase();\n' +
'    if (excludedUsers.indexOf(userName) >= 0) return;\n' +
'    if (item.values.active !== \'true\') return;\n' +
'\n' +
'    var gr = new GlideRecord(item.table);\n' +
'    if (gr.get(item.sys_id)) {\n' +
'        if (gr.department.nil()) {\n' +
'            var displayName = gr.getValue(\'name\') || gr.getValue(\'user_name\') || \'Unknown\';\n' +
'            issues.push({\n' +
'                code: \'USER_NO_DEPARTMENT\',\n' +
'                message: \'User "\' + displayName + \'" has no department assigned\',\n' +
'                severity: rule.severity || \'medium\',\n' +
'                record: item.sys_id,\n' +
'                record_table: item.table,\n' +
'                details: {\n' +
'                    record_name: displayName,\n' +
'                    user_name: gr.getValue(\'user_name\') || \'\',\n' +
'                    email: gr.getValue(\'email\') || \'\',\n' +
'                    created_on: item.values.sys_created_on || \'\',\n' +
'                    created_by: item.values.sys_created_by || \'\',\n' +
'                    updated_on: item.values.sys_updated_on || \'\',\n' +
'                    updated_by: item.values.sys_updated_by || \'\',\n' +
'                    recommendation: \'Assign a department to this user for proper role assignment and reporting.\'\n' +
'                }\n' +
'            });\n' +
'        }\n' +
'    }\n' +
'})();';
updateRuleScript('0752df6953eef250c7233ee0a0490e5d', script_USER_NO_DEPARTMENT);


// ---- 3.2  INVALID_DATE_RANGE (f6bf976553623650c7233ee0a0490e23) ----
gs.info('[IR-CLEANUP]   Fixing INVALID_DATE_RANGE...');
var script_INVALID_DATE_RANGE =
'(function executeRule() {\n' +
'    var startField = params.start_field || \'start_date\';\n' +
'    var endField = params.end_field || \'end_date\';\n' +
'    var startDate = item.values[startField];\n' +
'    var endDate = item.values[endField];\n' +
'    if (!startDate || !endDate) return;\n' +
'    var start = new GlideDateTime(startDate);\n' +
'    var end = new GlideDateTime(endDate);\n' +
'    if (end.before(start)) {\n' +
'        issues.push({\n' +
'            code: \'INVALID_DATE_RANGE\',\n' +
'            message: \'End date (\' + endField + \') is before start date (\' + startField + \') on "\' + (item.values.name || item.values.number || \'Record\') + \'"\',\n' +
'            severity: rule.severity || \'high\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: item.values.name || item.values.number || \'N/A\',\n' +
'                start_date: startDate,\n' +
'                end_date: endDate,\n' +
'                created_on: item.values.sys_created_on || \'\',\n' +
'                created_by: item.values.sys_created_by || \'\',\n' +
'                updated_on: item.values.sys_updated_on || \'\',\n' +
'                updated_by: item.values.sys_updated_by || \'\',\n' +
'                recommendation: \'Correct the date range so end date is after start date.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('f6bf976553623650c7233ee0a0490e23', script_INVALID_DATE_RANGE, {
    params: '{"start_field":"start_date","end_field":"end_date"}'
});


// ---- 3.3  GROUP_NO_MANAGER (f421e76953623650c7233ee0a0490efd) ----
gs.info('[IR-CLEANUP]   Fixing GROUP_NO_MANAGER...');
var script_GROUP_NO_MANAGER =
'(function executeRule() {\n' +
'    if (item.values.active !== \'true\') return;\n' +
'    var type = item.values.type || \'\';\n' +
'    if (type === \'system\') return;\n' +
'    if (!item.values.manager || item.values.manager === \'\') {\n' +
'        issues.push({\n' +
'            code: \'GROUP_NO_MANAGER\',\n' +
'            message: \'Group "\' + (item.values.name || \'Unknown\') + \'" has no manager assigned\',\n' +
'            severity: rule.severity || \'medium\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: item.values.name || \'N/A\',\n' +
'                created_on: item.values.sys_created_on || \'\',\n' +
'                created_by: item.values.sys_created_by || \'\',\n' +
'                updated_on: item.values.sys_updated_on || \'\',\n' +
'                updated_by: item.values.sys_updated_by || \'\',\n' +
'                recommendation: \'Assign a manager to this group.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('f421e76953623650c7233ee0a0490efd', script_GROUP_NO_MANAGER);


// ---- 3.4  br_density (f2a413f853a2be10c7233ee0a0490e92) — aggregate ----
gs.info('[IR-CLEANUP]   Fixing br_density...');
var script_br_density =
'(function executeRule() {\n' +
'    var threshold = params.threshold || 30;\n' +
'    var count = context.totalCount || 0;\n' +
'    if (count > threshold) {\n' +
'        issues.push({\n' +
'            code: \'br_density\',\n' +
'            message: \'Too many Business Rules (\' + count + \' > \' + threshold + \') on table "\' + tableName + \'". Consider consolidating.\',\n' +
'            severity: rule.severity || \'medium\',\n' +
'            record_table: tableName,\n' +
'            details: {\n' +
'                record_name: tableName,\n' +
'                total_count: count,\n' +
'                threshold: threshold,\n' +
'                recommendation: \'Review and consolidate Business Rules to improve performance.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('f2a413f853a2be10c7233ee0a0490e92', script_br_density);


// ---- 3.5  aggregate_metric (f6a413f853a2be10c7233ee0a0490e95) — aggregate ----
gs.info('[IR-CLEANUP]   Fixing aggregate_metric...');
var script_aggregate_metric =
'(function executeRule() {\n' +
'    var threshold = params.threshold || 0;\n' +
'    var operator = params.operator || \'gt\';\n' +
'    var total = context.totalCount || 0;\n' +
'    var condition = false;\n' +
'    switch(operator) {\n' +
'        case \'gt\': case \'>\': condition = total > threshold; break;\n' +
'        case \'gte\': case \'>=\': condition = total >= threshold; break;\n' +
'        case \'lt\': case \'<\': condition = total < threshold; break;\n' +
'        case \'lte\': case \'<=\': condition = total <= threshold; break;\n' +
'        case \'eq\': case \'=\': condition = total === threshold; break;\n' +
'        case \'ne\': case \'!=\': condition = total !== threshold; break;\n' +
'        default: condition = total > threshold;\n' +
'    }\n' +
'    if (condition) {\n' +
'        var opText = {\'gt\':\'greater than\',\'>\':\'greater than\',\'gte\':\'>=\',\'>=\':\'>=\',\'lt\':\'less than\',\'<\':\'less than\',\'lte\':\'<=\',\'<=\':\'<=\',\'eq\':\'equal to\',\'=\':\'equal to\',\'ne\':\'not equal to\',\'!=\':\'not equal to\'}[operator] || operator;\n' +
'        issues.push({\n' +
'            code: \'aggregate_metric\',\n' +
'            message: \'Metric on "\' + tableName + \'": \' + total + \' is \' + opText + \' \' + threshold,\n' +
'            severity: rule.severity || \'medium\',\n' +
'            record_table: tableName,\n' +
'            details: {\n' +
'                record_name: tableName,\n' +
'                total: total,\n' +
'                threshold: threshold,\n' +
'                operator: operator,\n' +
'                recommendation: \'Review the count of records and take action if needed.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('f6a413f853a2be10c7233ee0a0490e95', script_aggregate_metric);


// ---- 3.6  PORTAL_PAGE_NO_TITLE (ff52efe953623650c7233ee0a0490e8c) ----
gs.info('[IR-CLEANUP]   Fixing PORTAL_PAGE_NO_TITLE...');
var script_PORTAL_PAGE_NO_TITLE =
'(function executeRule() {\n' +
'    var publicPage = item.values[\'public\'];\n' +
'    var title = item.values.title || \'\';\n' +
'    if ((publicPage === \'true\') && title === \'\') {\n' +
'        issues.push({\n' +
'            code: \'PORTAL_PAGE_NO_TITLE\',\n' +
'            message: \'Public portal page "\' + (item.values.id || item.values.name || \'Unknown\') + \'" is missing a title\',\n' +
'            severity: rule.severity || \'medium\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: item.values.id || item.values.name || \'N/A\',\n' +
'                created_on: item.values.sys_created_on || \'\',\n' +
'                created_by: item.values.sys_created_by || \'\',\n' +
'                recommendation: \'Add a descriptive title for SEO and accessibility.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('ff52efe953623650c7233ee0a0490e8c', script_PORTAL_PAGE_NO_TITLE);


// ---- 3.7  DICTIONARY_POOR_LABEL (fb52efe953623650c7233ee0a0490e8a) ----
gs.info('[IR-CLEANUP]   Fixing DICTIONARY_POOR_LABEL...');
var script_DICTIONARY_POOR_LABEL =
'(function executeRule() {\n' +
'    var element = item.values.element || \'\';\n' +
'    var label = item.values.column_label || \'\';\n' +
'    if (element.indexOf(\'x_\') !== 0) return;\n' +
'    var hasTechnicalPattern = label.indexOf(\'_\') >= 0 || label === element || /^[a-z]+$/.test(label) || label.length < 3;\n' +
'    if (hasTechnicalPattern) {\n' +
'        issues.push({\n' +
'            code: \'DICTIONARY_POOR_LABEL\',\n' +
'            message: \'Custom field "\' + element + \'" has a technical label: "\' + label + \'"\',\n' +
'            severity: rule.severity || \'low\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: element,\n' +
'                current_label: label,\n' +
'                recommendation: \'Rename the label to a user-friendly name.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('fb52efe953623650c7233ee0a0490e8a', script_DICTIONARY_POOR_LABEL);


// ---- 3.8  TABLE_NO_DESCRIPTION (fed36f2153a23650c7233ee0a0490e20) ----
gs.info('[IR-CLEANUP]   Fixing TABLE_NO_DESCRIPTION...');
var script_TABLE_NO_DESCRIPTION =
'(function executeRule() {\n' +
'    var name = item.values.name || \'\';\n' +
'    if (name.indexOf(\'x_\') !== 0) return;\n' +
'    var description = item.values.comments || item.values.description || \'\';\n' +
'    if (!description || description.trim() === \'\') {\n' +
'        issues.push({\n' +
'            code: \'TABLE_NO_DESCRIPTION\',\n' +
'            message: \'Custom table "\' + name + \'" has no description\',\n' +
'            severity: rule.severity || \'medium\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: name,\n' +
'                recommendation: \'Add a description explaining the purpose of this table.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('fed36f2153a23650c7233ee0a0490e20', script_TABLE_NO_DESCRIPTION);


// ---- 3.9  ENCRYPTION_CONTEXT_WEAK (fc216b6953623650c7233ee0a0490e53) ----
gs.info('[IR-CLEANUP]   Fixing ENCRYPTION_CONTEXT_WEAK...');
var script_ENCRYPTION_CONTEXT_WEAK =
'(function executeRule() {\n' +
'    var type = (item.values.type || \'\').toLowerCase();\n' +
'    var weakAlgorithms = [\'md5\', \'sha1\', \'des\', \'rc4\'];\n' +
'    var isWeak = false;\n' +
'    weakAlgorithms.forEach(function(w) { if (type.indexOf(w) >= 0) isWeak = true; });\n' +
'    if (isWeak) {\n' +
'        issues.push({\n' +
'            code: \'ENCRYPTION_CONTEXT_WEAK\',\n' +
'            message: \'Encryption context "\' + (item.values.name || \'Unknown\') + \'" uses weak algorithm: \' + type,\n' +
'            severity: \'high\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: item.values.name || \'N/A\',\n' +
'                algorithm: type,\n' +
'                recommendation: \'Upgrade to AES-256 or stronger encryption.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('fc216b6953623650c7233ee0a0490e53', script_ENCRYPTION_CONTEXT_WEAK);


// ---- 3.10  INVALID_EMAIL_FORMAT (fabf976553623650c7233ee0a0490e1f) ----
gs.info('[IR-CLEANUP]   Fixing INVALID_EMAIL_FORMAT...');
var script_INVALID_EMAIL_FORMAT =
'(function executeRule() {\n' +
'    var fieldName = params.email_field || \'email\';\n' +
'    var emailValue = item.values[fieldName];\n' +
'    if (!emailValue || emailValue === \'\') return;\n' +
'    var emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n' +
'    if (!emailRegex.test(emailValue)) {\n' +
'        issues.push({\n' +
'            code: \'INVALID_EMAIL_FORMAT\',\n' +
'            message: \'Invalid email "\' + emailValue + \'" in field "\' + fieldName + \'" for "\' + (item.values.name || \'Record\') + \'"\',\n' +
'            severity: rule.severity || \'medium\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: item.values.name || \'N/A\',\n' +
'                email_value: emailValue,\n' +
'                field: fieldName,\n' +
'                recommendation: \'Correct the email address format.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('fabf976553623650c7233ee0a0490e1f', script_INVALID_EMAIL_FORMAT);


// ---- 3.11  br_heavy (faa413f853a2be10c7233ee0a0490e98) — needs GlideRecord ----
gs.info('[IR-CLEANUP]   Fixing br_heavy...');
var script_br_heavy =
'(function executeRule() {\n' +
'    var gr = new GlideRecord(item.table);\n' +
'    if (!gr.get(item.sys_id)) return;\n' +
'    var script = gr.getValue(\'script\') || \'\';\n' +
'    if (!script) return;\n' +
'    var lineCount = (script.match(/\\n/g) || []).length + 1;\n' +
'    var charCount = script.length;\n' +
'    var maxLines = params.max_lines || 100;\n' +
'    var maxChars = params.max_chars || 2000;\n' +
'    if (lineCount > maxLines || charCount > maxChars) {\n' +
'        var recordName = item.values.name || \'Business Rule\';\n' +
'        var sev = lineCount > 200 ? \'high\' : (rule.severity || \'medium\');\n' +
'        issues.push({\n' +
'            code: \'br_heavy\',\n' +
'            message: \'"\' + recordName + \'" is too complex: \' + lineCount + \' lines, \' + charCount + \' chars. Consider refactoring.\',\n' +
'            severity: sev,\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: recordName,\n' +
'                line_count: lineCount,\n' +
'                char_count: charCount,\n' +
'                max_lines: maxLines,\n' +
'                max_chars: maxChars,\n' +
'                recommendation: \'Refactor large scripts into Script Includes.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('faa413f853a2be10c7233ee0a0490e98', script_br_heavy);


// ---- 3.12  USER_NO_LOGIN_LONG_TIME (b021e76953623650c7233ee0a0490efb) ----
gs.info('[IR-CLEANUP]   Fixing USER_NO_LOGIN_LONG_TIME...');
var script_USER_NO_LOGIN_LONG_TIME =
'(function executeRule() {\n' +
'    if (item.values.active !== \'true\') return;\n' +
'    var lastLogin = item.values.last_login_time;\n' +
'    var threshold = params.days_threshold || 90;\n' +
'    var recordName = item.values.name || item.values.user_name || \'Unknown\';\n' +
'    if (!lastLogin || lastLogin === \'\') {\n' +
'        issues.push({\n' +
'            code: \'USER_NO_LOGIN_LONG_TIME\',\n' +
'            message: \'User "\' + recordName + \'" has never logged in\',\n' +
'            severity: rule.severity || \'medium\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: recordName,\n' +
'                days_inactive: \'never\',\n' +
'                recommendation: \'Review if this account is still needed.\'\n' +
'            }\n' +
'        });\n' +
'    } else {\n' +
'        var login = new GlideDateTime(lastLogin);\n' +
'        var now = new GlideDateTime();\n' +
'        var daysDiff = gs.dateDiff(login.getDisplayValue(), now.getDisplayValue(), true);\n' +
'        var daysInactive = Math.floor(daysDiff / 86400);\n' +
'        if (daysInactive > threshold) {\n' +
'            issues.push({\n' +
'                code: \'USER_NO_LOGIN_LONG_TIME\',\n' +
'                message: \'User "\' + recordName + \'" inactive for \' + daysInactive + \' days (threshold: \' + threshold + \')\',\n' +
'                severity: rule.severity || \'medium\',\n' +
'                record: item.sys_id,\n' +
'                record_table: item.table,\n' +
'                details: {\n' +
'                    record_name: recordName,\n' +
'                    days_inactive: daysInactive,\n' +
'                    last_login: lastLogin,\n' +
'                    recommendation: \'Review if this account is still needed or should be deactivated.\'\n' +
'                }\n' +
'            });\n' +
'        }\n' +
'    }\n' +
'})();';
updateRuleScript('b021e76953623650c7233ee0a0490efb', script_USER_NO_LOGIN_LONG_TIME);


// ---- 3.13  UNCONTROLLED_BR (af90ef6553623650c7233ee0a0490ed7) ----
gs.info('[IR-CLEANUP]   Fixing UNCONTROLLED_BR...');
var script_UNCONTROLLED_BR =
'(function executeRule() {\n' +
'    var when = item.values.when || \'\';\n' +
'    var condition = item.values.condition || \'\';\n' +
'    var filterCondition = item.values.filter_condition || \'\';\n' +
'    if ((when === \'before\' || when === \'after\') && !condition && !filterCondition) {\n' +
'        var isUpdate = item.values.update === \'true\' || item.values.update === true;\n' +
'        if (isUpdate) {\n' +
'            issues.push({\n' +
'                code: \'UNCONTROLLED_BR\',\n' +
'                message: \'Business Rule "\' + (item.values.name || \'Unknown\') + \'" runs on every update without conditions\',\n' +
'                severity: rule.severity || \'medium\',\n' +
'                record: item.sys_id,\n' +
'                record_table: item.table,\n' +
'                details: {\n' +
'                    record_name: item.values.name || \'N/A\',\n' +
'                    when: when,\n' +
'                    recommendation: \'Add a condition or filter to prevent this rule from running on every update.\'\n' +
'                }\n' +
'            });\n' +
'        }\n' +
'    }\n' +
'})();';
updateRuleScript('af90ef6553623650c7233ee0a0490ed7', script_UNCONTROLLED_BR);


// ---- 3.14  INTEGRATION_NO_ERROR_HANDLING (ae7c9fad53223650c7233ee0a0490e49) — needs GlideRecord ----
gs.info('[IR-CLEANUP]   Fixing INTEGRATION_NO_ERROR_HANDLING...');
var script_INTEGRATION_NO_ERROR_HANDLING =
'(function executeRule() {\n' +
'    var name = (item.values.name || \'\').toLowerCase();\n' +
'    if (name.indexOf(\'integration\') < 0 && name.indexOf(\'api\') < 0 && name.indexOf(\'rest\') < 0 && name.indexOf(\'soap\') < 0) return;\n' +
'    if (item.values.active !== \'true\') return;\n' +
'    var gr = new GlideRecord(item.table);\n' +
'    if (!gr.get(item.sys_id)) return;\n' +
'    var script = gr.getValue(\'script\') || \'\';\n' +
'    if (!script) return;\n' +
'    if (script.indexOf(\'try\') < 0 || script.indexOf(\'catch\') < 0) {\n' +
'        issues.push({\n' +
'            code: \'INTEGRATION_NO_ERROR_HANDLING\',\n' +
'            message: \'Integration script "\' + (item.values.name || \'Unknown\') + \'" lacks try/catch error handling\',\n' +
'            severity: rule.severity || \'medium\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: item.values.name || \'N/A\',\n' +
'                recommendation: \'Add try/catch blocks to handle errors in integration scripts.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('ae7c9fad53223650c7233ee0a0490e49', script_INTEGRATION_NO_ERROR_HANDLING);


// ---- 3.15  UI_ACTION_NO_CONDITION (ab90ef6553623650c7233ee0a0490ede) ----
gs.info('[IR-CLEANUP]   Fixing UI_ACTION_NO_CONDITION...');
var script_UI_ACTION_NO_CONDITION =
'(function executeRule() {\n' +
'    if (item.values.active !== \'true\') return;\n' +
'    var condition = item.values.condition || \'\';\n' +
'    if (condition !== \'\') return;\n' +
'    var showInsert = item.values.show_insert === \'true\';\n' +
'    var showUpdate = item.values.show_update === \'true\';\n' +
'    if (showInsert || showUpdate) {\n' +
'        var gr = new GlideRecord(item.table);\n' +
'        if (!gr.get(item.sys_id)) return;\n' +
'        var script = gr.getValue(\'script\') || \'\';\n' +
'        if (script) {\n' +
'            issues.push({\n' +
'                code: \'UI_ACTION_NO_CONDITION\',\n' +
'                message: \'UI Action "\' + (item.values.name || \'Unknown\') + \'" has a script but no condition\',\n' +
'                severity: rule.severity || \'low\',\n' +
'                record: item.sys_id,\n' +
'                record_table: item.table,\n' +
'                details: {\n' +
'                    record_name: item.values.name || \'N/A\',\n' +
'                    recommendation: \'Add a condition to control when this UI Action is displayed.\'\n' +
'                }\n' +
'            });\n' +
'        }\n' +
'    }\n' +
'})();';
updateRuleScript('ab90ef6553623650c7233ee0a0490ede', script_UI_ACTION_NO_CONDITION);


// ---- 3.16  CS_GLOBAL_SCRIPT (a790ef6553623650c7233ee0a0490edc) ----
gs.info('[IR-CLEANUP]   Fixing CS_GLOBAL_SCRIPT...');
var script_CS_GLOBAL_SCRIPT =
'(function executeRule() {\n' +
'    var isGlobal = item.values[\'global\'] === \'true\';\n' +
'    var type = item.values.type || \'\';\n' +
'    if (isGlobal && type === \'onLoad\') {\n' +
'        issues.push({\n' +
'            code: \'CS_GLOBAL_SCRIPT\',\n' +
'            message: \'Client Script "\' + (item.values.name || \'Unknown\') + \'" is global onLoad — impacts all pages\',\n' +
'            severity: \'high\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: item.values.name || \'N/A\',\n' +
'                type: type,\n' +
'                recommendation: \'Target this client script to specific tables instead of running globally.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('a790ef6553623650c7233ee0a0490edc', script_CS_GLOBAL_SCRIPT);


// ---- 3.17  EMAIL_ACCOUNT_NO_ENCRYPTION (b261a3a953623650c7233ee0a0490e31) ----
gs.info('[IR-CLEANUP]   Fixing EMAIL_ACCOUNT_NO_ENCRYPTION...');
var script_EMAIL_ACCOUNT_NO_ENCRYPTION =
'(function executeRule() {\n' +
'    if (item.values.active !== \'true\') return;\n' +
'    var port = parseInt(item.values.port || \'0\', 10);\n' +
'    var type = item.values.type || \'\';\n' +
'    var isInsecure = (type === \'POP3\' && port === 110) || (type === \'IMAP\' && port === 143) || (type === \'SMTP\' && port === 25);\n' +
'    if (isInsecure) {\n' +
'        issues.push({\n' +
'            code: \'EMAIL_ACCOUNT_NO_ENCRYPTION\',\n' +
'            message: \'Email account "\' + (item.values.name || \'Unknown\') + \'" uses insecure port \' + port + \' (\' + type + \')\',\n' +
'            severity: \'high\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: item.values.name || \'N/A\',\n' +
'                port: port,\n' +
'                protocol: type,\n' +
'                recommendation: \'Switch to SSL/TLS encrypted ports (993 for IMAP, 995 for POP3, 587/465 for SMTP).\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('b261a3a953623650c7233ee0a0490e31', script_EMAIL_ACCOUNT_NO_ENCRYPTION);


// ---- 3.18  SCRIPT_HARDCODED_CREDS (b27a5ba953223650c7233ee0a0490e7e) — needs GlideRecord ----
gs.info('[IR-CLEANUP]   Fixing SCRIPT_HARDCODED_CREDS...');
var script_SCRIPT_HARDCODED_CREDS =
'(function executeRule() {\n' +
'    if (item.values.active !== \'true\') return;\n' +
'    var gr = new GlideRecord(item.table);\n' +
'    if (!gr.get(item.sys_id)) return;\n' +
'    var script = gr.getValue(\'script\') || \'\';\n' +
'    if (!script) return;\n' +
'    var patterns = [\n' +
'        /password\\s*=\\s*[\'"][^\'"]{6,}[\'"]/i,\n' +
'        /api[_-]?key\\s*=\\s*[\'"][^\'"]{10,}[\'"]/i,\n' +
'        /secret\\s*=\\s*[\'"][^\'"]{10,}[\'"]/i,\n' +
'        /token\\s*=\\s*[\'"][^\'"]{20,}[\'"]/i\n' +
'    ];\n' +
'    var matched = [];\n' +
'    for (var i = 0; i < patterns.length; i++) {\n' +
'        if (patterns[i].test(script)) matched.push(patterns[i].source.split(\'\\\\s\')[0]);\n' +
'    }\n' +
'    if (matched.length > 0) {\n' +
'        issues.push({\n' +
'            code: \'SCRIPT_HARDCODED_CREDS\',\n' +
'            message: \'Potential hardcoded credentials in "\' + (item.values.name || \'Unknown\') + \'"\',\n' +
'            severity: \'critical\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: item.values.name || \'N/A\',\n' +
'                patterns_found: matched.join(\', \'),\n' +
'                recommendation: \'Replace hardcoded credentials with system properties or credentials store.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('b27a5ba953223650c7233ee0a0490e7e', script_SCRIPT_HARDCODED_CREDS);


// ---- 3.19  UPDATE_SET_UNTRACKED (b27a5ba953223650c7233ee0a0490e7f) ----
gs.info('[IR-CLEANUP]   Fixing UPDATE_SET_UNTRACKED...');
var script_UPDATE_SET_UNTRACKED =
'(function executeRule() {\n' +
'    var gr = new GlideRecord(item.table);\n' +
'    if (!gr.get(item.sys_id)) return;\n' +
'    if (!gr.update_set.nil()) return;\n' +
'    var created = new GlideDateTime(item.values.sys_created_on);\n' +
'    var sevenDaysAgo = new GlideDateTime();\n' +
'    sevenDaysAgo.addDaysLocalTime(-7);\n' +
'    if (created.after(sevenDaysAgo)) {\n' +
'        issues.push({\n' +
'            code: \'UPDATE_SET_UNTRACKED\',\n' +
'            message: \'Recent customization "\' + (item.values.name || \'Unknown\') + \'" made outside an update set\',\n' +
'            severity: rule.severity || \'medium\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: item.values.name || \'N/A\',\n' +
'                created_on: item.values.sys_created_on || \'\',\n' +
'                created_by: item.values.sys_created_by || \'\',\n' +
'                recommendation: \'Always use an update set when making customizations.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('b27a5ba953223650c7233ee0a0490e7f', script_UPDATE_SET_UNTRACKED);


// ---- 3.20  UPDATE_SET_TOO_LARGE (b27a5ba953223650c7233ee0a0490e80) — aggregate ----
gs.info('[IR-CLEANUP]   Fixing UPDATE_SET_TOO_LARGE...');
var script_UPDATE_SET_TOO_LARGE =
'(function executeRule() {\n' +
'    var ga = new GlideAggregate(\'sys_update_xml\');\n' +
'    ga.addAggregate(\'COUNT\');\n' +
'    ga.groupBy(\'update_set\');\n' +
'    ga.addHaving(\'COUNT\', \'>\', 500);\n' +
'    ga.query();\n' +
'    while (ga.next()) {\n' +
'        var updateSetId = ga.getValue(\'update_set\');\n' +
'        var count = parseInt(ga.getAggregate(\'COUNT\'), 10);\n' +
'        var usGr = new GlideRecord(\'sys_update_set\');\n' +
'        var usName = updateSetId;\n' +
'        if (usGr.get(updateSetId)) {\n' +
'            usName = usGr.getValue(\'name\') || updateSetId;\n' +
'        }\n' +
'        issues.push({\n' +
'            code: \'UPDATE_SET_TOO_LARGE\',\n' +
'            message: \'Update set "\' + usName + \'" contains \' + count + \' updates (>500)\',\n' +
'            severity: rule.severity || \'low\',\n' +
'            record_table: \'sys_update_set\',\n' +
'            details: {\n' +
'                record_name: usName,\n' +
'                update_count: count,\n' +
'                recommendation: \'Break large update sets into smaller logical units.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('b27a5ba953223650c7233ee0a0490e80', script_UPDATE_SET_TOO_LARGE);


// ---- 3.21  BR_ELEVATED_PRIVILEGES (b27a5ba953223650c7233ee0a0490e81) — needs GlideRecord ----
gs.info('[IR-CLEANUP]   Fixing BR_ELEVATED_PRIVILEGES...');
var script_BR_ELEVATED_PRIVILEGES =
'(function executeRule() {\n' +
'    var gr = new GlideRecord(item.table);\n' +
'    if (!gr.get(item.sys_id)) return;\n' +
'    var script = gr.getValue(\'script\') || \'\';\n' +
'    if (script.indexOf(\'setElevated(true)\') >= 0 || script.indexOf(\'executeNow(true)\') >= 0) {\n' +
'        issues.push({\n' +
'            code: \'BR_ELEVATED_PRIVILEGES\',\n' +
'            message: \'Business Rule "\' + (item.values.name || \'Unknown\') + \'" uses elevated privileges\',\n' +
'            severity: rule.severity || \'medium\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: item.values.name || \'N/A\',\n' +
'                recommendation: \'Verify elevated privileges are justified and document the reason.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('b27a5ba953223650c7233ee0a0490e81', script_BR_ELEVATED_PRIVILEGES);


// ---- 3.22  TABLE_NO_ACL (b27a5ba953223650c7233ee0a0490e82) ----
gs.info('[IR-CLEANUP]   Fixing TABLE_NO_ACL...');
var script_TABLE_NO_ACL =
'(function executeRule() {\n' +
'    var tableName = item.values.name || \'\';\n' +
'    if (tableName.indexOf(\'x_\') !== 0 && tableName.indexOf(\'u_\') !== 0) return;\n' +
'    var acl = new GlideRecord(\'sys_security_acl\');\n' +
'    acl.addQuery(\'name\', \'STARTSWITH\', tableName);\n' +
'    acl.setLimit(1);\n' +
'    acl.query();\n' +
'    if (!acl.hasNext()) {\n' +
'        issues.push({\n' +
'            code: \'TABLE_NO_ACL\',\n' +
'            message: \'Custom table "\' + tableName + \'" has no ACL rules defined\',\n' +
'            severity: \'high\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: tableName,\n' +
'                recommendation: \'Create ACLs to control access to this custom table.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('b27a5ba953223650c7233ee0a0490e82', script_TABLE_NO_ACL);


// ---- 3.23  ROLE_ELEVATED_PRIVILEGE (b4216b6953623650c7233ee0a0490e4e) ----
gs.info('[IR-CLEANUP]   Fixing ROLE_ELEVATED_PRIVILEGE...');
var script_ROLE_ELEVATED_PRIVILEGE =
'(function executeRule() {\n' +
'    var roleName = item.values.name || \'\';\n' +
'    var elevatedAccess = item.values.elevated_privilege;\n' +
'    var sensitivePatterns = [\'admin\', \'security_admin\', \'impersonator\'];\n' +
'    var isSensitive = false;\n' +
'    sensitivePatterns.forEach(function(p) { if (roleName.toLowerCase() === p) isSensitive = true; });\n' +
'    if (isSensitive || elevatedAccess === \'true\') {\n' +
'        var gr = new GlideAggregate(\'sys_user_has_role\');\n' +
'        gr.addQuery(\'role.name\', roleName);\n' +
'        gr.addQuery(\'user.active\', \'true\');\n' +
'        gr.addAggregate(\'COUNT\');\n' +
'        gr.query();\n' +
'        var userCount = 0;\n' +
'        if (gr.next()) userCount = parseInt(gr.getAggregate(\'COUNT\'), 10);\n' +
'        if (userCount > 10) {\n' +
'            issues.push({\n' +
'                code: \'ROLE_ELEVATED_PRIVILEGE\',\n' +
'                message: \'Sensitive role "\' + roleName + \'" is assigned to \' + userCount + \' active users\',\n' +
'                severity: \'high\',\n' +
'                record: item.sys_id,\n' +
'                record_table: item.table,\n' +
'                details: {\n' +
'                    record_name: roleName,\n' +
'                    user_count: userCount,\n' +
'                    recommendation: \'Review user assignments for this sensitive role.\'\n' +
'                }\n' +
'            });\n' +
'        }\n' +
'    }\n' +
'})();';
updateRuleScript('b4216b6953623650c7233ee0a0490e4e', script_ROLE_ELEVATED_PRIVILEGE);


// ---- 3.24  INACTIVE_BR_ON_CORE_TABLE (a390ef6553623650c7233ee0a0490eda) ----
gs.info('[IR-CLEANUP]   Fixing INACTIVE_BR_ON_CORE_TABLE...');
var script_INACTIVE_BR_ON_CORE_TABLE =
'(function executeRule() {\n' +
'    if (item.values.active !== \'false\') return;\n' +
'    var collection = item.values.collection || \'\';\n' +
'    var coreTables = [\'incident\', \'change_request\', \'problem\', \'sys_user\', \'cmdb_ci\', \'task\'];\n' +
'    if (coreTables.indexOf(collection) < 0) return;\n' +
'    var createdBy = item.values.sys_created_by || \'\';\n' +
'    if (createdBy === \'system\') return;\n' +
'    issues.push({\n' +
'        code: \'INACTIVE_BR_ON_CORE_TABLE\',\n' +
'        message: \'Inactive Business Rule "\' + (item.values.name || \'Unknown\') + \'" on core table "\' + collection + \'"\',\n' +
'        severity: rule.severity || \'low\',\n' +
'        record: item.sys_id,\n' +
'        record_table: item.table,\n' +
'        details: {\n' +
'            record_name: item.values.name || \'N/A\',\n' +
'            target_table: collection,\n' +
'            recommendation: \'Delete this inactive rule or document why it should be kept.\'\n' +
'        }\n' +
'    });\n' +
'})();';
updateRuleScript('a390ef6553623650c7233ee0a0490eda', script_INACTIVE_BR_ON_CORE_TABLE);


// ---- 3.25  WORKFLOW_NO_TIMEOUT (a3902b2953623650c7233ee0a0490efc) ----
gs.info('[IR-CLEANUP]   Fixing WORKFLOW_NO_TIMEOUT...');
var script_WORKFLOW_NO_TIMEOUT =
'(function executeRule() {\n' +
'    var timeout = item.values.timeout || \'\';\n' +
'    var activityType = item.values.activity_definition || \'\';\n' +
'    if ((!timeout || timeout === \'0\') && (activityType.indexOf(\'approval\') >= 0 || activityType.indexOf(\'wait\') >= 0)) {\n' +
'        issues.push({\n' +
'            code: \'WORKFLOW_NO_TIMEOUT\',\n' +
'            message: \'Workflow activity "\' + (item.values.name || \'Unknown\') + \'" has no timeout\',\n' +
'            severity: rule.severity || \'medium\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: item.values.name || \'N/A\',\n' +
'                activity_type: activityType,\n' +
'                recommendation: \'Add a timeout to prevent workflows from stalling indefinitely.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('a3902b2953623650c7233ee0a0490efc', script_WORKFLOW_NO_TIMEOUT);


// ---- 3.26  LOCATION_INCOMPLETE_ADDRESS (8f52df6953eef250c7233ee0a0490e62) — needs GlideRecord ----
gs.info('[IR-CLEANUP]   Fixing LOCATION_INCOMPLETE_ADDRESS...');
var script_LOCATION_INCOMPLETE_ADDRESS =
'(function executeRule() {\n' +
'    var gr = new GlideRecord(item.table);\n' +
'    if (!gr.get(item.sys_id)) return;\n' +
'    var missing = [];\n' +
'    if (gr.street.nil() || gr.getValue(\'street\').trim() === \'\') missing.push(\'street\');\n' +
'    if (gr.city.nil() || gr.getValue(\'city\').trim() === \'\') missing.push(\'city\');\n' +
'    if (gr.country.nil() || gr.getValue(\'country\').trim() === \'\') missing.push(\'country\');\n' +
'    if (missing.length > 0) {\n' +
'        issues.push({\n' +
'            code: \'LOCATION_INCOMPLETE_ADDRESS\',\n' +
'            message: \'Location "\' + (gr.getValue(\'name\') || \'Unknown\') + \'" is missing: \' + missing.join(\', \'),\n' +
'            severity: rule.severity || \'medium\',\n' +
'            record: item.sys_id,\n' +
'            record_table: item.table,\n' +
'            details: {\n' +
'                record_name: gr.getValue(\'name\') || \'N/A\',\n' +
'                missing_fields: missing.join(\', \'),\n' +
'                recommendation: \'Complete address information.\'\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'})();';
updateRuleScript('8f52df6953eef250c7233ee0a0490e62', script_LOCATION_INCOMPLETE_ADDRESS);


// ---- 3.27  RELATED_LIST_NO_CONDITION (f752a3e953623650c7233ee0a0490e51) ----
gs.info('[IR-CLEANUP]   Fixing RELATED_LIST_NO_CONDITION...');
var script_RELATED_LIST_NO_CONDITION =
'(function executeRule() {\n' +
'    var query = item.values.query || \'\';\n' +
'    if (query !== \'\') return;\n' +
'    issues.push({\n' +
'        code: \'RELATED_LIST_NO_CONDITION\',\n' +
'        message: \'Related list "\' + (item.values.name || \'Unknown\') + \'" has no filter condition\',\n' +
'        severity: rule.severity || \'low\',\n' +
'        record: item.sys_id,\n' +
'        record_table: item.table,\n' +
'        details: {\n' +
'            record_name: item.values.name || \'N/A\',\n' +
'            recommendation: \'Add a filter condition to limit displayed records.\'\n' +
'        }\n' +
'    });\n' +
'})();';
updateRuleScript('f752a3e953623650c7233ee0a0490e51', script_RELATED_LIST_NO_CONDITION);


gs.info('[IR-CLEANUP]   Part 3 complete: ' + counters.fixedScripts + ' scripts fixed.');


// =============================================================================
// PART 4: Deactivate duplicate Verification Items
// =============================================================================
gs.info('');
gs.info('================================================================');
gs.info('[IR-CLEANUP] PART 4: Deactivating duplicate Verification Items');
gs.info('================================================================');

// Client Scripts - Anti-Patterns duplicates (keep c0cd4bf4538fb210c7233ee0a0490ebd)
var viDuplicates = [
    { sysId: 'ab1713b853cfb210c7233ee0a0490ecb', reason: 'Duplicate Client Scripts Anti-Patterns VI (keep c0cd4bf4...)' },
    { sysId: '7e0c8ff0538fb210c7233ee0a0490e86', reason: 'Duplicate Client Scripts Anti-Patterns VI (keep c0cd4bf4...)' },
    { sysId: '949b8fb0538fb210c7233ee0a0490e88', reason: 'Duplicate Client Scripts Anti-Patterns VI (keep c0cd4bf4...)' },
    // Business Rules - Anti-Patterns duplicate (keep f5cc0334538fb210c7233ee0a0490e33)
    { sysId: 'e7079f7853cfb210c7233ee0a0490e8c', reason: 'Duplicate Business Rules Anti-Patterns VI (keep f5cc0334...)' }
];

for (var v = 0; v < viDuplicates.length; v++) {
    var viInfo = viDuplicates[v];
    gs.info('[IR-CLEANUP]   Deactivating VI: ' + viInfo.sysId + ' — ' + viInfo.reason);
    if (deactivateRecord(VI_TABLE, viInfo.sysId, 'VI')) {
        counters.deactivatedVIs++;
    }
}


// =============================================================================
// PART 5: Set Verification Item associations on Issue Rules
// =============================================================================
gs.info('');
gs.info('================================================================');
gs.info('[IR-CLEANUP] PART 5: Setting VI associations on Issue Rules');
gs.info('================================================================');

var viAssociations = [
    // IR sys_id                             IR code                         VI sys_ids (comma-separated)
    { sysId: 'f421e76953623650c7233ee0a0490efd', code: 'GROUP_NO_MANAGER',              vis: '7c216b6953623650c7233ee0a0490e58' },
    { sysId: 'af90ef6553623650c7233ee0a0490ed7', code: 'UNCONTROLLED_BR',               vis: 'e7902b2953623650c7233ee0a0490eff' },
    { sysId: 'a790ef6553623650c7233ee0a0490edc', code: 'CS_GLOBAL_SCRIPT',              vis: '63906b2953623650c7233ee0a0490e01,c0cd4bf4538fb210c7233ee0a0490ebd' },
    { sysId: 'a390ef6553623650c7233ee0a0490eda', code: 'INACTIVE_BR_ON_CORE_TABLE',     vis: 'e7902b2953623650c7233ee0a0490eff,f0de03a153eef250c7233ee0a0490e9a' },
    { sysId: 'b27a5ba953223650c7233ee0a0490e81', code: 'BR_ELEVATED_PRIVILEGES',        vis: 'f0de03a153eef250c7233ee0a0490e9a' },
    { sysId: 'fc216b6953623650c7233ee0a0490e53', code: 'ENCRYPTION_CONTEXT_WEAK',       vis: '6cf4efa153a23650c7233ee0a0490e61' },
    { sysId: 'fabf976553623650c7233ee0a0490e1f', code: 'INVALID_EMAIL_FORMAT',          vis: '7acdcbf4538fb210c7233ee0a0490e16' },
    { sysId: 'faa413f853a2be10c7233ee0a0490e98', code: 'br_heavy',                      vis: '54f1a3e953623650c7233ee0a0490e3c,579743f8534fb210c7233ee0a0490e82' },
    { sysId: 'b021e76953623650c7233ee0a0490efb', code: 'USER_NO_LOGIN_LONG_TIME',       vis: '7acdcbf4538fb210c7233ee0a0490e16' },
    { sysId: 'b4216b6953623650c7233ee0a0490e4e', code: 'ROLE_ELEVATED_PRIVILEGE',       vis: '7c216b6953623650c7233ee0a0490e66' },
    { sysId: 'ff52efe953623650c7233ee0a0490e8c', code: 'PORTAL_PAGE_NO_TITLE',          vis: 'fb52efe953623650c7233ee0a0490ea0' },
    { sysId: 'fb52efe953623650c7233ee0a0490e8a', code: 'DICTIONARY_POOR_LABEL',         vis: '50f4efa153a23650c7233ee0a0490e57' },
    { sysId: 'fed36f2153a23650c7233ee0a0490e20', code: 'TABLE_NO_DESCRIPTION',          vis: 'd0f1a3e953623650c7233ee0a0490e2b' },
    { sysId: 'b27a5ba953223650c7233ee0a0490e82', code: 'TABLE_NO_ACL',                  vis: '327a5ba953223650c7233ee0a0490e8f' },
    { sysId: 'f752a3e953623650c7233ee0a0490e51', code: 'RELATED_LIST_NO_CONDITION',     vis: 'd70d132153623650c7233ee0a0490ed1' },
    { sysId: 'b261a3a953623650c7233ee0a0490e31', code: 'EMAIL_ACCOUNT_NO_ENCRYPTION',   vis: 'f661a3a953623650c7233ee0a0490e3d' },
    { sysId: 'a3902b2953623650c7233ee0a0490efc', code: 'WORKFLOW_NO_TIMEOUT',           vis: 'e7906b2953623650c7233ee0a0490e0a' },
    { sysId: 'ab90ef6553623650c7233ee0a0490ede', code: 'UI_ACTION_NO_CONDITION',        vis: 'e3906b2953623650c7233ee0a0490e04' },
    { sysId: 'b27a5ba953223650c7233ee0a0490e7e', code: 'SCRIPT_HARDCODED_CREDS',       vis: 'f0de03a153eef250c7233ee0a0490e9a,d8f1a3e953623650c7233ee0a0490e3a' },
    { sysId: 'b27a5ba953223650c7233ee0a0490e7f', code: 'UPDATE_SET_UNTRACKED',          vis: 'be7a5ba953223650c7233ee0a0490e8b' },
    { sysId: '8f52df6953eef250c7233ee0a0490e62', code: 'LOCATION_INCOMPLETE_ADDRESS',   vis: '9752df6953eef250c7233ee0a0490e6e,36bf976553623650c7233ee0a0490e35' },
    { sysId: 'ae7c9fad53223650c7233ee0a0490e49', code: 'INTEGRATION_NO_ERROR_HANDLING', vis: 'd8f1a3e953623650c7233ee0a0490e3a' },
    { sysId: 'f6bf976553623650c7233ee0a0490e23', code: 'INVALID_DATE_RANGE',            vis: 'fabf976553623650c7233ee0a0490e2e' },
    { sysId: 'f2a413f853a2be10c7233ee0a0490e92', code: 'br_density',                    vis: '579743f8534fb210c7233ee0a0490e82' },
    // aggregate_metric — keep verification_items empty (generic rule)
    { sysId: 'b27a5ba953223650c7233ee0a0490e80', code: 'UPDATE_SET_TOO_LARGE',          vis: 'd8f4efa153a23650c7233ee0a0490e54' },
    // USER_NO_DEPARTMENT — set VI for sys_user
    { sysId: '0752df6953eef250c7233ee0a0490e5d', code: 'USER_NO_DEPARTMENT',            vis: '7acdcbf4538fb210c7233ee0a0490e16' }
];

for (var vi = 0; vi < viAssociations.length; vi++) {
    var assoc = viAssociations[vi];
    gs.info('[IR-CLEANUP]   Setting verification_items on "' + assoc.code + '" -> ' + assoc.vis);
    if (updateRule(assoc.sysId, { verification_items: assoc.vis })) {
        counters.updatedVIAssociations++;
    }
}


// =============================================================================
// SUMMARY
// =============================================================================
gs.info('');
gs.info('================================================================');
gs.info('[IR-CLEANUP] EXECUTION SUMMARY');
gs.info('================================================================');
gs.info('[IR-CLEANUP]   Issue Rules deactivated:        ' + counters.deactivatedIRs);
gs.info('[IR-CLEANUP]   Execution modes fixed:          ' + counters.fixedExecutionMode);
gs.info('[IR-CLEANUP]   Rule scripts fixed:             ' + counters.fixedScripts);
gs.info('[IR-CLEANUP]   Duplicate VIs deactivated:      ' + counters.deactivatedVIs);
gs.info('[IR-CLEANUP]   VI associations updated:        ' + counters.updatedVIAssociations);
gs.info('[IR-CLEANUP]   Errors encountered:             ' + counters.errors);
gs.info('[IR-CLEANUP]   Total records modified:         ' + (counters.deactivatedIRs + counters.fixedExecutionMode + counters.fixedScripts + counters.deactivatedVIs + counters.updatedVIAssociations));
gs.info('================================================================');
gs.info('[IR-CLEANUP] Script complete.');
gs.info('================================================================');
