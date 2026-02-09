// =====================================================================
// SCRIPT: Create or Update Single Issue Rule
// =====================================================================
// Description: Creates or updates a single Issue Rule
// Usage: Modify the rule object below and run in ServiceNow Background Script
// Date: 2026-01-18
// Version: 2.0.0
// =====================================================================

(function createOrUpdateSingleRule() {
    
    // ============= CONFIGURE YOUR RULE HERE =============
    
    var rule = {
        code: 'MY_CUSTOM_RULE',                    // REQUIRED: Unique code (used to check if rule exists)
        name: 'My Custom Rule',                    // REQUIRED: Display name
        type: 'custom',                            // OPTIONAL: Type/category
        severity: 'medium',                        // REQUIRED: low, medium, or high
        description: 'This is my custom rule that checks for specific conditions in records.',  // REQUIRED: Detailed description
        params: '{"threshold": 50}',               // OPTIONAL: JSON string with parameters
        script: [                                  // REQUIRED: JavaScript code to execute
            'var threshold = params.threshold || 50;',
            'var recordName = item.values.name || \'Record\';',
            '',
            'if (condition) {  // Replace with your condition',
            '    issues.push({',
            '        code: rule.code,',
            '        message: \'Issue detected in "\' + recordName + \'".\',',
            '        severity: rule.severity || \'medium\',',
            '        details: {',
            '            record_table: item.table,',
            '            record_sys_id: item.sys_id,',
            '            record_name: recordName,',
            '            recommendation: \'Take action to fix this issue\'',
            '        }',
            '    });',
            '}'
        ].join('\n')
    };
    
    // ============= NO NEED TO MODIFY BELOW THIS LINE =============
    
    var tableName = 'x_1310794_founda_0_issue_rules';
    
    try {
        // Check if rule exists by code
        var gr = new GlideRecord(tableName);
        gr.addQuery('code', rule.code);
        gr.query();
        
        var isUpdate = false;
        
        if (gr.next()) {
            // UPDATE existing rule
            isUpdate = true;
            gs.info('===================================');
            gs.info('Rule found - Updating: ' + rule.code);
            gs.info('===================================');
        } else {
            // CREATE new rule
            gr.initialize();
            gs.info('===================================');
            gs.info('Rule not found - Creating: ' + rule.code);
            gs.info('===================================');
        }
        
        // Set values
        gr.setValue('code', rule.code);
        gr.setValue('name', rule.name);
        gr.setValue('type', rule.type || '');
        gr.setValue('severity', rule.severity);
        gr.setValue('description', rule.description);
        gr.setValue('params', rule.params || '{}');
        gr.setValue('script', rule.script);
        gr.setValue('active', true);
        
        // Save
        var sysId;
        if (isUpdate) {
            sysId = gr.update();
        } else {
            sysId = gr.insert();
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
        
    } catch(e) {
        gs.error('❌ EXCEPTION: ' + e.message);
        gs.error('Stack trace: ' + e.stack);
        return {
            success: false,
            error: e.message
        };
    }
    
})();
