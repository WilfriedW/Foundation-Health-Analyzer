// =====================================================================
// SCRIPT: Import or Update Issue Rules
// =====================================================================
// Description: Creates or updates Issue Rules in the x_1310794_founda_0_issue_rules table
// Usage: Run in ServiceNow Background Script
// Date: 2026-01-18
// Version: 2.0.0
// =====================================================================

(function importOrUpdateIssueRules() {
    
    var tableName = 'x_1310794_founda_0_issue_rules';
    var rules = [];
    
    // ============= DEFINE YOUR RULES HERE =============
    
    // EXAMPLE: How to add a new rule
    rules.push({
        code: 'INACTIVE_RECORD',
        name: 'Inactive Record',
        type: 'inactive',
        severity: 'low',
        description: 'Detects inactive records (active=false). Useful for finding unused or deactivated components that could be removed to reduce clutter.',
        params: '{}',
        script: 'var activeVal = (item.values.active || \'\').toString().toLowerCase();\n' +
                'if (activeVal === \'false\') {\n' +
                '    var recordName = item.values.name || item.values.title || \'Record\';\n' +
                '    var message = \'Inactive record: "\' + recordName + \'". Consider activating or removing if no longer needed.\';\n' +
                '    issues.push({\n' +
                '        code: rule.code,\n' +
                '        message: message,\n' +
                '        severity: rule.severity || \'low\',\n' +
                '        details: { \n' +
                '            field: \'active\', \n' +
                '            expected: \'true\', \n' +
                '            actual: \'false\',\n' +
                '            record_table: item.table,\n' +
                '            record_sys_id: item.sys_id,\n' +
                '            record_name: recordName,\n' +
                '            recommendation: \'Activate or remove if not used\'\n' +
                '        }\n' +
                '    });\n' +
                '}'
    });
    
    rules.push({
        code: 'SYSTEM_CREATED',
        name: 'Created by System User',
        type: 'system_created',
        severity: 'low',
        description: 'Identifies records created by the "system" user. These records may lack proper ownership and documentation, making maintenance difficult.',
        params: '{}',
        script: 'var createdBy = (item.values.sys_created_by || \'\').toString();\n' +
                'if (createdBy === \'system\') {\n' +
                '    var recordName = item.values.name || item.values.title || \'Record\';\n' +
                '    var message = \'Record "\' + recordName + \'" created by system user. Review ownership and ensure proper documentation.\';\n' +
                '    issues.push({\n' +
                '        code: rule.code,\n' +
                '        message: message,\n' +
                '        severity: rule.severity || \'low\',\n' +
                '        details: {\n' +
                '            field: \'sys_created_by\',\n' +
                '            actual: \'system\',\n' +
                '            record_table: item.table,\n' +
                '            record_sys_id: item.sys_id,\n' +
                '            record_name: recordName,\n' +
                '            recommendation: \'System-created records should have clear documentation and ownership\'\n' +
                '        }\n' +
                '    });\n' +
                '}'
    });
    
    rules.push({
        code: 'MANY_RECORDS',
        name: 'Too Many Records',
        type: 'count_threshold',
        severity: 'medium',
        description: 'Aggregate handler that checks if the total count of records exceeds a threshold. Use params {"threshold": 30} to set the limit.',
        params: '{"threshold":50}',
        script: 'var threshold = params.threshold || 0;\n' +
                'var total = (context && context.totalCount) || 0;\n' +
                '\n' +
                'if (!context) context = {};\n' +
                'if (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};\n' +
                'var key = \'count_threshold_\' + rule.code;\n' +
                'if (context._aggregateIssuesFired[key]) return issues;\n' +
                '\n' +
                'if (threshold && total > threshold) {\n' +
                '    context._aggregateIssuesFired[key] = true;\n' +
                '    var message = \'Too many records (\' + total + \' > \' + threshold + \'). Review and clean up unnecessary records.\';\n' +
                '    issues.push({\n' +
                '        code: rule.code,\n' +
                '        message: message,\n' +
                '        severity: rule.severity || \'medium\',\n' +
                '        details: {\n' +
                '            count: total,\n' +
                '            threshold: threshold,\n' +
                '            recommendation: \'Reduce the number of records to improve performance\'\n' +
                '        }\n' +
                '    });\n' +
                '}'
    });
    
    rules.push({
        code: 'HARDCODED_SYSID',
        name: 'Hardcoded Sys ID',
        type: 'hardcoded_sys_id',
        severity: 'high',
        description: 'Scans scripts and fields for hardcoded 32-character sys_ids. Use params {"fields": "script,query_value"} to specify which fields to scan.',
        params: '{"fields":"script"}',
        script: 'var regex = /[0-9a-f]{32}/ig;\n' +
                'var hits = [];\n' +
                'var recordName = item.values.name || item.values.title || \'Record\';\n' +
                '\n' +
                'var fields = (params.fields || \'\').split(\',\').map(function(f){ return (f || \'\').trim(); }).filter(function(f){ return !!f; });\n' +
                'for (var i = 0; i < fields.length; i++) {\n' +
                '    var f = fields[i];\n' +
                '    var val = (item.values && item.values[f]) || \'\';\n' +
                '    if (typeof val !== \'string\') continue;\n' +
                '    var matches = val.match(regex);\n' +
                '    if (matches && matches.length > 0) {\n' +
                '        hits.push({ field: f, matches: matches, count: matches.length });\n' +
                '    }\n' +
                '}\n' +
                '\n' +
                'if (hits.length > 0) {\n' +
                '    var totalSysIds = 0;\n' +
                '    var fieldsList = [];\n' +
                '    hits.forEach(function(h) {\n' +
                '        totalSysIds += h.count;\n' +
                '        fieldsList.push(h.field + \' (\' + h.count + \')\');\n' +
                '    });\n' +
                '    \n' +
                '    var message = \'Hardcoded sys_id(s) detected in "\' + recordName + \'": \' + totalSysIds + \' occurrence(s) in fields [\' + fieldsList.join(\', \') + \']. Replace with dynamic queries.\';\n' +
                '    \n' +
                '    issues.push({\n' +
                '        code: rule.code,\n' +
                '        message: message,\n' +
                '        severity: rule.severity || \'high\',\n' +
                '        details: {\n' +
                '            hits: hits,\n' +
                '            total_sys_ids: totalSysIds,\n' +
                '            fields: fieldsList,\n' +
                '            record_table: item.table,\n' +
                '            record_sys_id: item.sys_id,\n' +
                '            record_name: recordName,\n' +
                '            recommendation: \'Replace hardcoded sys_ids with dynamic queries using name or other unique fields\'\n' +
                '        }\n' +
                '    });\n' +
                '}'
    });
    
    rules.push({
        code: 'MISSING_FIELD',
        name: 'Missing Required Field',
        type: 'missing_field',
        severity: 'medium',
        description: 'Checks if required fields are empty. Use params {"fields": "description,comments"} to specify which fields to check.',
        params: '{"fields":"description"}',
        script: 'var fields = (params.field || params.fields || \'\').split(\',\');\n' +
                'var recordName = item.values.name || item.values.title || \'Record\';\n' +
                '\n' +
                'fields.forEach(function(fRaw) {\n' +
                '    var f = (fRaw || \'\').trim();\n' +
                '    if (!f) return;\n' +
                '    var v = item.values[f];\n' +
                '    if (v === undefined || v === null || v === \'\') {\n' +
                '        var message = \'Missing required field "\' + f + \'" in "\' + recordName + \'". This may cause issues or incomplete configuration.\';\n' +
                '        issues.push({\n' +
                '            code: rule.code,\n' +
                '            message: message,\n' +
                '            severity: rule.severity || \'medium\',\n' +
                '            details: { \n' +
                '                field: f,\n' +
                '                record_table: item.table,\n' +
                '                record_sys_id: item.sys_id,\n' +
                '                record_name: recordName,\n' +
                '                recommendation: \'Fill in the \' + f + \' field to complete the configuration\'\n' +
                '            }\n' +
                '        });\n' +
                '    }\n' +
                '});'
    });
    
    rules.push({
        code: 'BR_HEAVY',
        name: 'Heavy Business Rule',
        type: 'br_heavy',
        severity: 'medium',
        description: 'Checks if Business Rule script is too long. Use params {"max_lines": 100, "max_chars": 2000} to set limits.',
        params: '{"max_lines":100,"max_chars":2000}',
        script: 'if (item.values.script) {\n' +
                '    var script = item.values.script.toString();\n' +
                '    var lineCount = (script.match(/\\n/g) || []).length + 1;\n' +
                '    var charCount = script.length;\n' +
                '    var maxLines = params.max_lines || 100;\n' +
                '    var maxChars = params.max_chars || 2000;\n' +
                '\n' +
                '    if (lineCount > maxLines || charCount > maxChars) {\n' +
                '        var recordName = item.values.name || \'Business Rule\';\n' +
                '        var message = \'Business Rule "\' + recordName + \'" is too complex: \' + lineCount + \' lines, \' + charCount + \' characters. Consider refactoring into Script Include.\';\n' +
                '        \n' +
                '        issues.push({\n' +
                '            code: rule.code,\n' +
                '            message: message,\n' +
                '            severity: lineCount > 200 ? \'high\' : (rule.severity || \'medium\'),\n' +
                '            details: {\n' +
                '                line_count: lineCount,\n' +
                '                char_count: charCount,\n' +
                '                max_lines: maxLines,\n' +
                '                max_chars: maxChars,\n' +
                '                record_table: item.table,\n' +
                '                record_sys_id: item.sys_id,\n' +
                '                record_name: recordName,\n' +
                '                recommendation: \'Break down into smaller functions in a Script Include\'\n' +
                '            }\n' +
                '        });\n' +
                '    }\n' +
                '}'
    });
    
    rules.push({
        code: 'BR_DENSITY',
        name: 'Too Many Business Rules',
        type: 'br_density',
        severity: 'medium',
        description: 'Aggregate handler for detecting too many business rules on a table. Use params {"threshold": 30} to set the limit.',
        params: '{"threshold":30}',
        script: 'var count = context && context.totalCount;\n' +
                'var threshold = params.threshold || 0;\n' +
                '\n' +
                'if (!context) context = {};\n' +
                'if (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};\n' +
                'var key = \'br_density_\' + rule.code;\n' +
                'if (context._aggregateIssuesFired[key]) return issues;\n' +
                '\n' +
                'if (threshold && count > threshold) {\n' +
                '    context._aggregateIssuesFired[key] = true;\n' +
                '    \n' +
                '    var tableName = item.table || \'sys_script\';\n' +
                '    var tableValue = item.values && item.values.collection ? item.values.collection : \'unknown\';\n' +
                '    \n' +
                '    var message = \'Too many Business Rules (\' + count + \' > \' + threshold + \') - Table: \' + tableValue + \'. Click to view all active Business Rules and consider consolidating to improve performance.\';\n' +
                '    \n' +
                '    issues.push({\n' +
                '        code: rule.code,\n' +
                '        message: message,\n' +
                '        severity: rule.severity || \'medium\',\n' +
                '        details: {\n' +
                '            count: count,\n' +
                '            threshold: threshold,\n' +
                '            table: tableValue,\n' +
                '            record_table: \'sys_script\',\n' +
                '            record_filter: \'collection=\' + tableValue + \'^active=true\',\n' +
                '            record_name: \'View \' + count + \' Business Rules\'\n' +
                '        }\n' +
                '    });\n' +
                '}'
    });
    
    rules.push({
        code: 'DUPLICATE',
        name: 'Duplicate Record',
        type: 'duplicate',
        severity: 'medium',
        description: 'Detects duplicate records based on key fields. Use params {"key_fields": "name,code"} to specify which fields define uniqueness.',
        params: '{"key_fields":"name"}',
        script: 'var keyFields = params.key_fields || \'name\';\n' +
                'var fields = keyFields.split(\',\').map(function(f){ return (f || \'\').trim(); });\n' +
                '\n' +
                'var keyParts = [];\n' +
                'fields.forEach(function(f) {\n' +
                '    keyParts.push(item.values[f] || \'\');\n' +
                '});\n' +
                'var key = keyParts.join(\'|\');\n' +
                '\n' +
                'var seen = context && context._dupsSeen;\n' +
                'if (!seen) return issues;\n' +
                '\n' +
                'if (seen[key] && seen[key] !== item.sys_id) {\n' +
                '    var recordName = item.values.name || item.values.title || \'Record\';\n' +
                '    var message = \'Duplicate detected: "\' + recordName + \'" has the same \' + fields.join(\', \') + \' as another record. This may cause conflicts.\';\n' +
                '    \n' +
                '    issues.push({\n' +
                '        code: rule.code,\n' +
                '        message: message,\n' +
                '        severity: rule.severity || \'medium\',\n' +
                '        details: { \n' +
                '            duplicate_of: seen[key],\n' +
                '            key_fields: fields,\n' +
                '            key_value: key,\n' +
                '            record_table: item.table,\n' +
                '            record_sys_id: item.sys_id,\n' +
                '            record_name: recordName,\n' +
                '            recommendation: \'Rename or merge with the duplicate record\'\n' +
                '        }\n' +
                '    });\n' +
                '}'
    });
    
    rules.push({
        code: 'SIZE_THRESHOLD',
        name: 'Field Size Exceeds Threshold',
        type: 'size_threshold',
        severity: 'medium',
        description: 'Checks if a field exceeds a maximum length. Useful for detecting overly large scripts. Use params {"field": "script", "max_len": 5000}.',
        params: '{"field":"script","max_len":5000}',
        script: 'var field = params.field || \'text\';\n' +
                'var maxLen = params.max_len || 0;\n' +
                'var val = (item.values[field] || \'\').toString();\n' +
                'var recordName = item.values.name || item.values.title || \'Record\';\n' +
                '\n' +
                'if (maxLen && val.length > maxLen) {\n' +
                '    var percentage = Math.round((val.length / maxLen) * 100);\n' +
                '    var message = \'Field "\' + field + \'" too long in "\' + recordName + \'": \' + val.length + \' characters (limit: \' + maxLen + \', \' + percentage + \'%). Consider refactoring or splitting.\';\n' +
                '    \n' +
                '    issues.push({\n' +
                '        code: rule.code,\n' +
                '        message: message,\n' +
                '        severity: rule.severity || \'medium\',\n' +
                '        details: { \n' +
                '            field: field, \n' +
                '            length: val.length,\n' +
                '            max_length: maxLen,\n' +
                '            percentage: percentage,\n' +
                '            record_table: item.table,\n' +
                '            record_sys_id: item.sys_id,\n' +
                '            record_name: recordName,\n' +
                '            recommendation: \'Break down large \' + field + \' into smaller functions or modules\'\n' +
                '        }\n' +
                '    });\n' +
                '}'
    });
    
    rules.push({
        code: 'FIELD_CHECK',
        name: 'Generic Field Check',
        type: 'field_check',
        severity: 'medium',
        description: 'Generic field checker with various operators. Use params {"field": "active", "operator": "equals", "expected": "false", "message_template": "Custom message"}. Operators: equals, not_equals, contains, not_contains, empty, not_empty, regex, gt, lt, gte, lte.',
        params: '{"field":"active","operator":"equals","expected":"false"}',
        script: 'var field = params.field;\n' +
                'if (!field) return issues;\n' +
                '\n' +
                'var value = item.values && item.values[field];\n' +
                'var operator = params.operator || \'equals\';\n' +
                'var expected = params.expected;\n' +
                'var recordName = item.values.name || item.values.title || \'Record\';\n' +
                '\n' +
                'var condition = false;\n' +
                'var actualStr = String(value || \'\');\n' +
                'var expectedStr = String(expected || \'\');\n' +
                '\n' +
                'switch(operator) {\n' +
                '    case \'equals\':\n' +
                '        condition = actualStr === expectedStr;\n' +
                '        break;\n' +
                '    case \'not_equals\':\n' +
                '        condition = actualStr !== expectedStr;\n' +
                '        break;\n' +
                '    case \'contains\':\n' +
                '        condition = actualStr.indexOf(expectedStr) !== -1;\n' +
                '        break;\n' +
                '    case \'not_contains\':\n' +
                '        condition = actualStr.indexOf(expectedStr) === -1;\n' +
                '        break;\n' +
                '    case \'empty\':\n' +
                '        condition = !value || value === \'\';\n' +
                '        break;\n' +
                '    case \'not_empty\':\n' +
                '        condition = value && value !== \'\';\n' +
                '        break;\n' +
                '    case \'regex\':\n' +
                '        try {\n' +
                '            var regex = new RegExp(expectedStr);\n' +
                '            condition = regex.test(actualStr);\n' +
                '        } catch(e) {\n' +
                '            gs.warn(\'[field_check] Invalid regex: \' + expectedStr);\n' +
                '            return issues;\n' +
                '        }\n' +
                '        break;\n' +
                '    case \'gt\':\n' +
                '        condition = parseFloat(value) > parseFloat(expected);\n' +
                '        break;\n' +
                '    case \'lt\':\n' +
                '        condition = parseFloat(value) < parseFloat(expected);\n' +
                '        break;\n' +
                '    case \'gte\':\n' +
                '        condition = parseFloat(value) >= parseFloat(expected);\n' +
                '        break;\n' +
                '    case \'lte\':\n' +
                '        condition = parseFloat(value) <= parseFloat(expected);\n' +
                '        break;\n' +
                '    default:\n' +
                '        gs.warn(\'[field_check] Unknown operator: \' + operator);\n' +
                '        return issues;\n' +
                '}\n' +
                '\n' +
                'if (condition) {\n' +
                '    var message = params.message_template || \n' +
                '        \'Field "\' + field + \'" \' + operator + \' "\' + expectedStr + \'" in "\' + recordName + \'"\';\n' +
                '    \n' +
                '    issues.push({\n' +
                '        code: rule.code,\n' +
                '        message: message,\n' +
                '        severity: rule.severity || \'medium\',\n' +
                '        details: {\n' +
                '            field: field,\n' +
                '            operator: operator,\n' +
                '            expected: expectedStr,\n' +
                '            actual: actualStr,\n' +
                '            record_table: item.table,\n' +
                '            record_sys_id: item.sys_id,\n' +
                '            record_name: recordName\n' +
                '        }\n' +
                '    });\n' +
                '}'
    });
    
    rules.push({
        code: 'PATTERN_SCAN',
        name: 'Pattern Scan (Regex)',
        type: 'pattern_scan',
        severity: 'high',
        description: 'Scans specified fields for regex patterns. Use params {"fields": "script,comments", "pattern": "eval\\\\(", "message_template": "Dangerous eval() detected"}.',
        params: '{"fields":"script","pattern":"eval\\\\("}',
        script: 'if (!params.pattern) return issues;\n' +
                '\n' +
                'var pattern = params.pattern;\n' +
                'var fields = (params.fields || \'\').split(\',\').map(function(f){ return (f || \'\').trim(); }).filter(function(f){ return !!f; });\n' +
                'var recordName = item.values.name || item.values.title || \'Record\';\n' +
                '\n' +
                'try {\n' +
                '    var regex = new RegExp(pattern, \'i\');\n' +
                '    \n' +
                '    for (var i = 0; i < fields.length; i++) {\n' +
                '        var field = fields[i];\n' +
                '        var value = item.values && item.values[field];\n' +
                '        if (!value || typeof value !== \'string\') continue;\n' +
                '        \n' +
                '        var match = value.match(regex);\n' +
                '        if (match) {\n' +
                '            var message = params.message_template || \n' +
                '                \'Pattern "\' + pattern + \'" found in field "\' + field + \'" of "\' + recordName + \'"\';\n' +
                '            \n' +
                '            issues.push({\n' +
                '                code: rule.code,\n' +
                '                message: message,\n' +
                '                severity: rule.severity || \'high\',\n' +
                '                details: {\n' +
                '                    field: field,\n' +
                '                    pattern: pattern,\n' +
                '                    match: match[0],\n' +
                '                    record_table: item.table,\n' +
                '                    record_sys_id: item.sys_id,\n' +
                '                    record_name: recordName\n' +
                '                }\n' +
                '            });\n' +
                '            return issues;\n' +
                '        }\n' +
                '    }\n' +
                '} catch(e) {\n' +
                '    gs.warn(\'[pattern_scan] Invalid regex: \' + pattern + \' - \' + e.message);\n' +
                '}'
    });
    
    rules.push({
        code: 'CS_HEAVY',
        name: 'Heavy Client Script',
        type: 'cs_heavy',
        severity: 'medium',
        description: 'Checks if Client Script is too heavy or contains anti-patterns (GlideAjax, loops, DOM manipulation).',
        params: '{"max_lines":50}',
        script: 'if (item.values.script) {\n' +
                '    var script = item.values.script.toString();\n' +
                '    var lineCount = (script.match(/\\n/g) || []).length + 1;\n' +
                '    var maxLines = params.max_lines || 50;\n' +
                '\n' +
                '    // Check for anti-patterns\n' +
                '    var hasGlideAjax = script.indexOf(\'GlideAjax\') !== -1;\n' +
                '    var hasLoops = /for\\s*\\(|while\\s*\\(/.test(script);\n' +
                '    var hasDOMManip = /document\\.|getElementById|querySelector/.test(script);\n' +
                '\n' +
                '    var issues_found = [];\n' +
                '    if (lineCount > maxLines) issues_found.push(lineCount + \' lines\');\n' +
                '    if (hasGlideAjax) issues_found.push(\'GlideAjax call\');\n' +
                '    if (hasLoops) issues_found.push(\'loops\');\n' +
                '    if (hasDOMManip) issues_found.push(\'DOM manipulation\');\n' +
                '\n' +
                '    if (issues_found.length > 0) {\n' +
                '        var recordName = item.values.name || \'Client Script\';\n' +
                '        var message = \'Client Script "\' + recordName + \'" may impact performance: \' + issues_found.join(\', \') + \'.\';\n' +
                '        \n' +
                '        issues.push({\n' +
                '            code: rule.code,\n' +
                '            message: message,\n' +
                '            severity: issues_found.length > 2 ? \'high\' : (rule.severity || \'medium\'),\n' +
                '            details: {\n' +
                '                line_count: lineCount,\n' +
                '                max_lines: maxLines,\n' +
                '                has_ajax: hasGlideAjax,\n' +
                '                has_loops: hasLoops,\n' +
                '                has_dom_manip: hasDOMManip,\n' +
                '                record_table: item.table,\n' +
                '                record_sys_id: item.sys_id,\n' +
                '                record_name: recordName,\n' +
                '                recommendation: \'Optimize by reducing complexity and avoiding synchronous operations\'\n' +
                '            }\n' +
                '        });\n' +
                '    }\n' +
                '}'
    });
    
    rules.push({
        code: 'ACL_PERMISSIVE',
        name: 'Overly Permissive ACL',
        type: 'acl_issue',
        severity: 'high',
        description: 'Detects ACLs with conditions that are too broad or without protection (no role, condition or script).',
        params: '{}',
        script: 'if (item.values.operation && item.values.admin_overrides !== \'true\') {\n' +
                '    var type = item.values.type || \'\';\n' +
                '    var script = item.values.script || \'\';\n' +
                '\n' +
                '    // Checks\n' +
                '    var hasRole = item.values.roles && item.values.roles.length > 0;\n' +
                '    var hasCondition = item.values.condition && item.values.condition.length > 10;\n' +
                '    var hasScript = script.length > 10;\n' +
                '\n' +
                '    // ACL without protection\n' +
                '    if (!hasRole && !hasCondition && !hasScript) {\n' +
                '        var recordName = item.values.name || \'ACL\';\n' +
                '        var message = \'ACL "\' + recordName + \'" has no restrictions (no role, condition, or script). This grants access to everyone.\';\n' +
                '        \n' +
                '        issues.push({\n' +
                '            code: rule.code,\n' +
                '            message: message,\n' +
                '            severity: \'high\',\n' +
                '            details: {\n' +
                '                operation: item.values.operation,\n' +
                '                type: type,\n' +
                '                record_table: item.table,\n' +
                '                record_sys_id: item.sys_id,\n' +
                '                record_name: recordName,\n' +
                '                recommendation: \'Add role requirements, conditions, or script restrictions\'\n' +
                '            }\n' +
                '        });\n' +
                '    }\n' +
                '\n' +
                '    // ACL with script "return true"\n' +
                '    if (hasScript && /return\\s+true\\s*;?\\s*$/.test(script.trim())) {\n' +
                '        var recordName = item.values.name || \'ACL\';\n' +
                '        var message = \'ACL "\' + recordName + \'" script always returns true. Remove or add logic.\';\n' +
                '        \n' +
                '        issues.push({\n' +
                '            code: rule.code,\n' +
                '            message: message,\n' +
                '            severity: \'high\',\n' +
                '            details: {\n' +
                '                script_preview: script.substring(0, 100),\n' +
                '                record_table: item.table,\n' +
                '                record_sys_id: item.sys_id,\n' +
                '                record_name: recordName,\n' +
                '                recommendation: \'Add proper access control logic\'\n' +
                '            }\n' +
                '        });\n' +
                '    }\n' +
                '}'
    });
    
    // Rule 14: Out-of-Box Element Modified
    rules.push({
        code: 'OOB_MODIFIED',
        name: 'Out-of-Box Element Modified',
        type: 'oob_modified',
        severity: 'high',
        description: 'Detects out-of-box ServiceNow elements that have been modified by custom users. This is important to identify as modifying OOB elements can cause upgrade issues and should be avoided. Best practice is to clone OOB elements before customizing them.',
        params: '{"servicenow_users":"system,admin,maint,guest"}',
        script: '// Get list of ServiceNow users from params or use default\n' +
                'var snUsers = params.servicenow_users ? \n' +
                '    params.servicenow_users.split(\',\').map(function(u) { return u.trim(); }) :\n' +
                '    [\'system\', \'admin\', \'maint\', \'guest\'];\n' +
                '\n' +
                'var createdBy = (item.values.sys_created_by || \'\').toString();\n' +
                'var updatedBy = (item.values.sys_updated_by || \'\').toString();\n' +
                'var recordName = item.values.name || item.values.title || \'Record\';\n' +
                '\n' +
                '// Check if created by ServiceNow user\n' +
                'var isCreatedBySN = snUsers.indexOf(createdBy) !== -1;\n' +
                '// Check if updated by ServiceNow user\n' +
                'var isUpdatedBySN = snUsers.indexOf(updatedBy) !== -1;\n' +
                '\n' +
                '// If created by SN but updated by someone else (and they are different)\n' +
                'if (isCreatedBySN && !isUpdatedBySN && createdBy !== updatedBy) {\n' +
                '    var message = \'Out-of-Box record "\' + recordName + \'" has been modified by \' + updatedBy + \n' +
                '                  \'. Original creator: \' + createdBy + \n' +
                '                  \'. This is a customization of a ServiceNow OOB element.\';\n' +
                '    \n' +
                '    issues.push({\n' +
                '        code: rule.code,\n' +
                '        message: message,\n' +
                '        severity: \'high\',\n' +
                '        details: {\n' +
                '            record_table: item.table,\n' +
                '            record_sys_id: item.sys_id,\n' +
                '            record_name: recordName,\n' +
                '            sys_created_by: createdBy,\n' +
                '            sys_updated_by: updatedBy,\n' +
                '            sys_package: item.values.sys_package || \'\',\n' +
                '            sys_scope: item.values.sys_scope || \'\',\n' +
                '            recommendation: \'Review this customization - modifying OOB elements can cause upgrade issues. Consider cloning the OOB element and customizing the clone instead.\'\n' +
                '        }\n' +
                '    });\n' +
                '}'
    });
    
    // ============= EXECUTION =============
    
    gs.info('====================================');
    gs.info('Starting Issue Rules Import/Update');
    gs.info('Total rules to process: ' + rules.length);
    gs.info('====================================');
    
    var created = 0;
    var updated = 0;
    var errors = 0;
    var skipped = 0;
    
    rules.forEach(function(ruleData) {
        try {
            // Check if rule exists by code
            var gr = new GlideRecord(tableName);
            gr.addQuery('code', ruleData.code);
            gr.query();
            
            if (gr.next()) {
                // UPDATE existing rule
                gr.setValue('name', ruleData.name);
                gr.setValue('type', ruleData.type);
                gr.setValue('severity', ruleData.severity);
                gr.setValue('description', ruleData.description);
                gr.setValue('params', ruleData.params);
                gr.setValue('script', ruleData.script);
                gr.setValue('active', true);
                
                var sysId = gr.update();
                if (sysId) {
                    updated++;
                    gs.info('[UPDATED] ' + ruleData.code + ' - ' + ruleData.name + ' (sys_id: ' + sysId + ')');
                } else {
                    errors++;
                    gs.error('[ERROR] Failed to update: ' + ruleData.code);
                }
            } else {
                // CREATE new rule
                gr.initialize();
                gr.setValue('code', ruleData.code);
                gr.setValue('name', ruleData.name);
                gr.setValue('type', ruleData.type);
                gr.setValue('severity', ruleData.severity);
                gr.setValue('description', ruleData.description);
                gr.setValue('params', ruleData.params);
                gr.setValue('script', ruleData.script);
                gr.setValue('active', true);
                
                var sysId = gr.insert();
                if (sysId) {
                    created++;
                    gs.info('[CREATED] ' + ruleData.code + ' - ' + ruleData.name + ' (sys_id: ' + sysId + ')');
                } else {
                    errors++;
                    gs.error('[ERROR] Failed to create: ' + ruleData.code);
                }
            }
        } catch(e) {
            errors++;
            gs.error('[ERROR] Exception processing rule: ' + ruleData.code + ' - ' + e.message);
        }
    });
    
    gs.info('====================================');
    gs.info('Import/Update Complete!');
    gs.info('Created: ' + created);
    gs.info('Updated: ' + updated);
    gs.info('Errors: ' + errors);
    gs.info('Skipped: ' + skipped);
    gs.info('Total: ' + (created + updated + errors + skipped) + ' / ' + rules.length);
    gs.info('====================================');
    
    // Return summary
    return {
        created: created,
        updated: updated,
        errors: errors,
        skipped: skipped,
        total: rules.length
    };
    
})();
