// =====================================================================
// SCRIPT: Create SCRIPT_TOO_LARGE Issue Rule
// =====================================================================
// Description: Creates the issue rule to detect scripts that are too large
// Usage: Run in ServiceNow Background Script
// Date: 2026-01-18
// =====================================================================

(function createScriptTooLargeRule() {
    
    var tableName = 'x_1310794_founda_0_issue_rules';
    var ruleCode = 'SCRIPT_TOO_LARGE';
    
    gs.info('===================================');
    gs.info('Creating SCRIPT_TOO_LARGE issue rule');
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
        name: 'Script Too Large',
        type: 'script_too_large',
        severity: 'medium',
        description: 'Detects scripts that are too large (in lines or characters). Large scripts in Business Rules or Client Scripts can cause performance issues and are harder to maintain. Best practice is to refactor large logic into reusable Script Includes.',
        params: '{"line_threshold":100,"char_threshold":2000,"high_threshold":200,"script_field":"script"}',
        script: [
            '(function executeRule() {',
            '    // Get thresholds from params or use defaults',
            '    var lineThreshold = params.line_threshold || 100;',
            '    var charThreshold = params.char_threshold || 2000;',
            '    var highThreshold = params.high_threshold || 200;',
            '    ',
            '    // Get script field (can be "script", "script_true", "script_false", etc.)',
            '    var scriptField = params.script_field || \'script\';',
            '    var scriptContent = item.values[scriptField] || \'\';',
            '    ',
            '    // Early exit if no script',
            '    if (!scriptContent || scriptContent.trim() === \'\') return issues;',
            '    ',
            '    // Count lines and characters',
            '    var lines = scriptContent.split(\'\\n\');',
            '    var lineCount = lines.length;',
            '    var charCount = scriptContent.length;',
            '    ',
            '    // Check if exceeds thresholds',
            '    if (lineCount > lineThreshold || charCount > charThreshold) {',
            '        var recordName = item.values.name || \'Script\';',
            '        ',
            '        // Determine severity based on size',
            '        var severity = rule.severity || \'medium\';',
            '        if (lineCount > highThreshold) {',
            '            severity = \'high\';',
            '        }',
            '        ',
            '        // Calculate non-empty lines (exclude comments and blank lines)',
            '        var nonEmptyLines = 0;',
            '        var commentLines = 0;',
            '        lines.forEach(function(line) {',
            '            var trimmed = line.trim();',
            '            if (trimmed.length > 0) {',
            '                nonEmptyLines++;',
            '                if (trimmed.indexOf(\'//\') === 0 || trimmed.indexOf(\'/*\') === 0 || trimmed.indexOf(\'*\') === 0) {',
            '                    commentLines++;',
            '                }',
            '            }',
            '        });',
            '        var codeLines = nonEmptyLines - commentLines;',
            '        ',
            '        var message = \'Script too large for "\' + recordName + \'": \' + ',
            '                      lineCount + \' lines (\' + codeLines + \' code, \' + commentLines + \' comments), \' + ',
            '                      charCount + \' characters. \' +',
            '                      \'Consider refactoring into Script Include.\';',
            '        ',
            '        issues.push({',
            '            code: rule.code,',
            '            message: message,',
            '            severity: severity,',
            '            details: {',
            '                record_table: item.table,',
            '                record_sys_id: item.sys_id,',
            '                record_name: recordName,',
            '                script_field: scriptField,',
            '                total_lines: lineCount,',
            '                code_lines: codeLines,',
            '                comment_lines: commentLines,',
            '                char_count: charCount,',
            '                line_threshold: lineThreshold,',
            '                char_threshold: charThreshold,',
            '                high_threshold: highThreshold,',
            '                recommendation: \'Refactor large scripts into reusable Script Includes for better maintainability, performance, and reusability. Large scripts can cause performance issues.\'',
            '            }',
            '        });',
            '    }',
            '    ',
            '    return issues;',
            '})();'
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
        gs.info('Parameters:');
        gs.info('  - line_threshold: 100 lines');
        gs.info('  - char_threshold: 2000 characters');
        gs.info('  - high_threshold: 200 lines (high severity)');
        gs.info('  - script_field: script (can be customized)');
        gs.info('');
        gs.info('This rule will detect:');
        gs.info('  - Business Rules with > 100 lines');
        gs.info('  - Client Scripts with > 100 lines');
        gs.info('  - Any script with > 2000 characters');
        gs.info('  - High severity if > 200 lines');
        gs.info('');
        gs.info('Usage examples:');
        gs.info('  1. Business Rules: Use default params');
        gs.info('  2. Client Scripts: Set line_threshold: 50');
        gs.info('  3. UI Actions: Set script_field: "script"');
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
    
})();
