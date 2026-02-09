// =====================================================================
// SCRIPT: Create OOB_MODIFIED Issue Rule
// =====================================================================
// Description: Creates the issue rule to detect OOB elements that have
//              been modified by custom users
// Usage: Run in ServiceNow Background Script
// Date: 2026-01-18
// =====================================================================

(function createOOBModifiedRule() {
    
    var tableName = 'x_1310794_founda_0_issue_rules';
    var ruleCode = 'OOB_MODIFIED';
    
    gs.info('===================================');
    gs.info('Creating OOB_MODIFIED issue rule');
    gs.info('===================================');
    
    // Check if rule already exists
    var checkGr = new GlideRecord(tableName);
    checkGr.addQuery('code', ruleCode);
    checkGr.query();
    
    var isUpdate = false;
    
    if (checkGr.next()) {
        isUpdate = true;
        gs.info('Rule found - Updating: ' + ruleCode);
    } else {
        checkGr.initialize();
        gs.info('Rule not found - Creating: ' + ruleCode);
    }
    
    // Define the rule
    var rule = {
        code: ruleCode,
        name: 'Out-of-Box Element Modified',
        type: 'oob_modified',
        severity: 'high',
        description: 'Detects out-of-box ServiceNow elements that have been modified by custom users. This is important to identify as modifying OOB elements can cause upgrade issues and should be avoided. Best practice is to clone OOB elements before customizing them.',
        params: '{"servicenow_users":"system,admin,maint,guest"}',
        script: [
            '// Get list of ServiceNow users from params or use default',
            'var snUsers = params.servicenow_users ? ',
            '    params.servicenow_users.split(\',\').map(function(u) { return u.trim(); }) :',
            '    [\'system\', \'admin\', \'maint\', \'guest\'];',
            '',
            'var createdBy = (item.values.sys_created_by || \'\').toString();',
            'var updatedBy = (item.values.sys_updated_by || \'\').toString();',
            'var recordName = item.values.name || item.values.title || \'Record\';',
            '',
            '// Check if created by ServiceNow user',
            'var isCreatedBySN = snUsers.indexOf(createdBy) !== -1;',
            '// Check if updated by ServiceNow user',
            'var isUpdatedBySN = snUsers.indexOf(updatedBy) !== -1;',
            '',
            '// If created by SN but updated by someone else (and they are different)',
            'if (isCreatedBySN && !isUpdatedBySN && createdBy !== updatedBy) {',
            '    var message = \'Out-of-Box record "\' + recordName + \'" has been modified by \' + updatedBy + ',
            '                  \'. Original creator: \' + createdBy + ',
            '                  \'. This is a customization of a ServiceNow OOB element.\';',
            '    ',
            '    issues.push({',
            '        code: rule.code,',
            '        message: message,',
            '        severity: \'high\',',
            '        details: {',
            '            record_table: item.table,',
            '            record_sys_id: item.sys_id,',
            '            record_name: recordName,',
            '            sys_created_by: createdBy,',
            '            sys_updated_by: updatedBy,',
            '            sys_package: item.values.sys_package || \'\',',
            '            sys_scope: item.values.sys_scope || \'\',',
            '            recommendation: \'Review this customization - modifying OOB elements can cause upgrade issues. Consider cloning the OOB element and customizing the clone instead.\'',
            '        }',
            '    });',
            '}'
        ].join('\n')
    };
    
    // Set values
    checkGr.setValue('code', rule.code);
    checkGr.setValue('name', rule.name);
    checkGr.setValue('type', rule.type);
    checkGr.setValue('severity', rule.severity);
    checkGr.setValue('description', rule.description);
    checkGr.setValue('params', rule.params);
    checkGr.setValue('script', rule.script);
    checkGr.setValue('active', true);
    
    // Save
    var sysId;
    if (isUpdate) {
        sysId = checkGr.update();
    } else {
        sysId = checkGr.insert();
    }
    
    if (sysId) {
        gs.info('');
        gs.info('✅ SUCCESS!');
        gs.info('');
        gs.info('Action: ' + (isUpdate ? 'UPDATED' : 'CREATED'));
        gs.info('Code: ' + rule.code);
        gs.info('Name: ' + rule.name);
        gs.info('Severity: ' + rule.severity);
        gs.info('Sys ID: ' + sysId);
        gs.info('');
        gs.info('View rule at:');
        gs.info('👉 /x_1310794_founda_0_issue_rules.do?sys_id=' + sysId);
        gs.info('');
        gs.info('This rule will detect:');
        gs.info('  - OOB elements created by: ' + rule.params);
        gs.info('  - That were modified by users NOT in that list');
        gs.info('');
        gs.info('Usage:');
        gs.info('  1. Add this rule to your Verification Items');
        gs.info('  2. Enable ignore_servicenow_records option');
        gs.info('  3. Run analysis');
        gs.info('  4. Review OOB modifications flagged');
        gs.info('');
        gs.info('===================================');
        
        return {
            success: true,
            action: isUpdate ? 'updated' : 'created',
            sys_id: sysId,
            code: rule.code
        };
    } else {
        gs.error('❌ FAILED to ' + (isUpdate ? 'update' : 'create') + ' rule: ' + rule.code);
        return {
            success: false,
            error: 'Failed to save rule'
        };
    }
    
})();
