// =====================================================================
// FIX SCRIPT: Migrate Handlers to x_1310794_founda_0_issue_rules Table
// =====================================================================
// Run this script in ServiceNow Script Background
// This will create all 35 handlers as records in the issue_rules table

(function migrateHandlersToTable() {
    var tableName = 'x_1310794_founda_0_issue_rules';
    var handlers = [];
    
    // ============= HANDLER DEFINITIONS =============
    
    handlers.push({
        name: 'Inactive Record Handler',
        code: 'inactive',
        type: 'inactive',
        severity: 'low',
        description: 'Detects inactive records (active=false). Useful for finding unused or deactivated components that could be removed to reduce clutter.',
        params: '{}',
        script: 'var activeVal = (item.values.active || \'\').toString().toLowerCase();\nif (activeVal === \'false\') {\n    var recordName = item.values.name || item.values.title || \'Record\';\n    var message = \'Inactive record: "\' + recordName + \'". Consider activating or removing if no longer needed.\';\n    issues.push({\n        code: rule.code,\n        message: message,\n        severity: rule.severity || \'low\',\n        details: { \n            field: \'active\', \n            expected: \'true\', \n            actual: \'false\',\n            record_table: item.table,\n            record_sys_id: item.sys_id,\n            record_name: recordName\n        }\n    });\n}\nreturn issues;'
    });
    
    handlers.push({
        name: 'System Created Record Handler',
        code: 'system_created',
        type: 'system_created',
        severity: 'low',
        description: 'Identifies records created by the "system" user. These records may lack proper ownership and documentation, making maintenance difficult.',
        params: '{}',
        script: 'var createdBy = (item.values.sys_created_by || \'\').toString();\nif (createdBy === \'system\') {\n    var recordName = item.values.name || item.values.title || \'Record\';\n    var message = \'Record "\' + recordName + \'" created by system user. Review ownership and ensure proper documentation.\';\n    issues.push({\n        code: rule.code,\n        message: message,\n        severity: rule.severity || \'low\',\n        details: {\n            field: \'sys_created_by\',\n            actual: \'system\',\n            record_table: item.table,\n            record_sys_id: item.sys_id,\n            record_name: recordName,\n            recommendation: \'System-created records should have clear documentation and ownership\'\n        }\n    });\n}\nreturn issues;'
    });
    
    handlers.push({
        name: 'Count Threshold Handler',
        code: 'count_threshold',
        type: 'count_threshold',
        severity: 'medium',
        description: 'Aggregate handler that checks if the total count of records exceeds a threshold. Use params {"threshold": 30} to set the limit.',
        params: '{"threshold": 50}',
        script: 'var threshold = params.threshold || 0;\nvar total = (context && context.totalCount) || 0;\n\nif (!context) context = {};\nif (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};\nvar key = \'count_threshold_\' + rule.code;\nif (context._aggregateIssuesFired[key]) return issues;\n\nif (threshold && total > threshold) {\n    context._aggregateIssuesFired[key] = true;\n    var message = \'Too many records (\' + total + \' > \' + threshold + \'). Review and clean up unnecessary records.\';\n    issues.push({\n        code: rule.code,\n        message: message,\n        severity: rule.severity || \'medium\',\n        details: {\n            count: total,\n            threshold: threshold\n        }\n    });\n}\nreturn issues;'
    });
    
    handlers.push({
        name: 'Missing Field Handler',
        code: 'missing_field',
        type: 'missing_field',
        severity: 'medium',
        description: 'Checks if required fields are empty. Use params {"fields": "description,comments"} to specify which fields to check.',
        params: '{"fields": "description"}',
        script: 'var fields = (params.field || params.fields || \'\').split(\',\');\nvar recordName = item.values.name || item.values.title || \'Record\';\n\nfields.forEach(function(fRaw) {\n    var f = (fRaw || \'\').trim();\n    if (!f) return;\n    var v = item.values[f];\n    if (v === undefined || v === null || v === \'\') {\n        var message = \'Missing required field "\' + f + \'" in "\' + recordName + \'". This may cause issues or incomplete configuration.\';\n        issues.push({\n            code: rule.code,\n            message: message,\n            severity: rule.severity || \'medium\',\n            details: { \n                field: f,\n                record_table: item.table,\n                record_sys_id: item.sys_id,\n                record_name: recordName,\n                recommendation: \'Fill in the \' + f + \' field to complete the configuration\'\n            }\n        });\n    }\n});\nreturn issues;'
    });
    
    handlers.push({
        name: 'Missing ACL Handler',
        code: 'missing_acl',
        type: 'missing_acl',
        severity: 'high',
        description: 'Detects missing Access Control Lists (ACLs) on tables or resources. Requires verification item to set missing_acl=true in query results.',
        params: '{}',
        script: 'if (item.values && item.values.missing_acl === \'true\') {\n    issues.push({\n        code: rule.code,\n        message: \'Missing ACL on table/resource\',\n        severity: rule.severity || \'high\',\n        details: {}\n    });\n}\nreturn issues;'
    });
    
    handlers.push({
        name: 'ACL Issue Handler',
        code: 'acl_issue',
        type: 'acl_issue',
        severity: 'high',
        description: 'Detects overly permissive ACLs. Requires verification item to set acl_too_wide=true in query results.',
        params: '{}',
        script: 'if (item.values && item.values.acl_too_wide === \'true\') {\n    issues.push({\n        code: rule.code,\n        message: \'ACL too permissive\',\n        severity: rule.severity || \'high\',\n        details: {}\n    });\n}\nreturn issues;'
    });
    
    handlers.push({
        name: 'Index Needed Handler',
        code: 'index_needed',
        type: 'index_needed',
        severity: 'medium',
        description: 'Identifies fields that need database indexes for performance. Use params {"field": "assigned_to"}.',
        params: '{"field": "unknown"}',
        script: 'var field = params.field || \'unknown\';\nif (item.values && item.values.index_needed === \'true\') {\n    issues.push({\n        code: rule.code,\n        message: \'Index needed on \' + field,\n        severity: rule.severity || \'medium\',\n        details: { field: field }\n    });\n}\nreturn issues;'
    });
    
    handlers.push({
        name: 'Size Threshold Handler',
        code: 'size_threshold',
        type: 'size_threshold',
        severity: 'medium',
        description: 'Checks if a field exceeds a maximum length. Useful for detecting overly large scripts. Use params {"field": "script", "max_len": 5000}.',
        params: '{"field": "script", "max_len": 5000}',
        script: 'var field = params.field || \'text\';\nvar maxLen = params.max_len || 0;\nvar val = (item.values[field] || \'\').toString();\nvar recordName = item.values.name || item.values.title || \'Record\';\n\nif (maxLen && val.length > maxLen) {\n    var percentage = Math.round((val.length / maxLen) * 100);\n    var message = \'Field "\' + field + \'" too long in "\' + recordName + \'": \' + val.length + \' characters (limit: \' + maxLen + \', \' + percentage + \'%). Consider refactoring or splitting.\';\n    \n    issues.push({\n        code: rule.code,\n        message: message,\n        severity: rule.severity || \'medium\',\n        details: { \n            field: field, \n            length: val.length,\n            max_length: maxLen,\n            percentage: percentage,\n            record_table: item.table,\n            record_sys_id: item.sys_id,\n            record_name: recordName,\n            recommendation: \'Break down large \' + field + \' into smaller functions or modules\'\n        }\n    });\n}\nreturn issues;'
    });
    
    handlers.push({
        name: 'Duplicate Handler',
        code: 'duplicate',
        type: 'duplicate',
        severity: 'medium',
        description: 'Detects duplicate records based on key fields. Use params {"key_fields": "name,code"} to specify which fields define uniqueness.',
        params: '{"key_fields": "name,code"}',
        script: 'var keyFields = params.key_fields || \'name,code\';\nvar fields = keyFields.split(\',\').map(function(f){ return (f || \'\').trim(); });\n\nvar keyParts = [];\nfields.forEach(function(f) {\n    keyParts.push(item.values[f] || \'\');\n});\nvar key = keyParts.join(\'|\');\n\nvar seen = context && context._dupsSeen;\nif (!seen) return issues;\n\nif (seen[key] && seen[key] !== item.sys_id) {\n    var recordName = item.values.name || item.values.title || \'Record\';\n    var message = \'Duplicate detected: "\' + recordName + \'" has the same \' + fields.join(\', \') + \' as another record. This may cause conflicts.\';\n    \n    issues.push({\n        code: rule.code,\n        message: message,\n        severity: rule.severity || \'medium\',\n        details: { \n            duplicate_of: seen[key],\n            key_fields: fields,\n            key_value: key,\n            record_table: item.table,\n            record_sys_id: item.sys_id,\n            record_name: recordName,\n            recommendation: \'Rename or merge with the duplicate record\'\n        }\n    });\n}\nreturn issues;'
    });
    
    handlers.push({
        name: 'Business Rule Density Handler',
        code: 'br_density',
        type: 'br_density',
        severity: 'medium',
        description: 'Aggregate handler for detecting too many business rules on a table. Use params {"threshold": 30} to set the limit.',
        params: '{"threshold": 30}',
        script: 'var count = context && context.totalCount;\nvar threshold = params.threshold || 0;\n\nif (!context) context = {};\nif (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};\nvar key = \'br_density_\' + rule.code;\nif (context._aggregateIssuesFired[key]) return issues;\n\nif (threshold && count > threshold) {\n    context._aggregateIssuesFired[key] = true;\n    \n    var tableName = item.table || \'sys_script\';\n    var tableValue = item.values && item.values.collection ? item.values.collection : \'unknown\';\n    \n    var message = \'Too many Business Rules (\' + count + \' > \' + threshold + \') - Table: \' + tableValue + \'. Click to view all active Business Rules and consider consolidating to improve performance.\';\n    \n    issues.push({\n        code: rule.code,\n        message: message,\n        severity: rule.severity || \'medium\',\n        details: {\n            count: count,\n            threshold: threshold,\n            table: tableValue,\n            record_table: \'sys_script\',\n            record_filter: \'collection=\' + tableValue + \'^active=true\',\n            record_name: \'View \' + count + \' Business Rules\'\n        }\n    });\n}\nreturn issues;'
    });
    
    handlers.push({
        name: 'Hardcoded Sys ID Handler',
        code: 'hardcoded_sys_id',
        type: 'hardcoded_sys_id',
        severity: 'medium',
        description: 'Scans scripts and fields for hardcoded 32-character sys_ids. Use params {"fields": "script,query_value"} to specify which fields to scan.',
        params: '{"fields": "script"}',
        script: 'var regex = /[0-9a-f]{32}/ig;\nvar hits = [];\nvar recordName = item.values.name || item.values.title || \'Record\';\n\nvar fields = (params.fields || \'\').split(\',\').map(function(f){ return (f || \'\').trim(); }).filter(function(f){ return !!f; });\nfor (var i = 0; i < fields.length; i++) {\n    var f = fields[i];\n    var val = (item.values && item.values[f]) || \'\';\n    if (typeof val !== \'string\') continue;\n    var matches = val.match(regex);\n    if (matches && matches.length > 0) {\n        hits.push({ field: f, matches: matches, count: matches.length });\n    }\n}\n\nvar sources = [\n    { field: \'query_script\', value: item.query_script },\n    { field: \'query_value\', value: item.query_value },\n    { field: \'metadata\', value: item.metadata },\n    { field: \'script\', value: item.values && item.values.script }\n];\nfor (var j = 0; j < sources.length; j++) {\n    var src = sources[j];\n    if (!src.value || typeof src.value !== \'string\') continue;\n    var m = src.value.match(regex);\n    if (m && m.length > 0) {\n        hits.push({ field: src.field, matches: m, count: m.length });\n    }\n}\n\nif (hits.length > 0) {\n    var totalSysIds = 0;\n    var fieldsList = [];\n    hits.forEach(function(h) {\n        totalSysIds += h.count;\n        fieldsList.push(h.field + \' (\' + h.count + \')\');\n    });\n    \n    var message = \'Hardcoded sys_id(s) detected in "\' + recordName + \'": \' + totalSysIds + \' occurrence(s) in fields [\' + fieldsList.join(\', \') + \']. Replace with dynamic queries or GlideRecord lookups.\';\n    \n    issues.push({\n        code: rule.code,\n        message: message,\n        severity: rule.severity || \'medium\',\n        details: {\n            hits: hits,\n            total_sys_ids: totalSysIds,\n            fields: fieldsList,\n            record_table: item.table,\n            record_sys_id: item.sys_id,\n            record_name: recordName,\n            recommendation: \'Replace hardcoded sys_ids with dynamic queries using name or other unique fields\'\n        }\n    });\n}\nreturn issues;'
    });
    
    handlers.push({
        name: 'Field Check Handler',
        code: 'field_check',
        type: 'field_check',
        severity: 'medium',
        description: 'Generic field checker with various operators. Use params {"field": "active", "operator": "equals", "expected": "false", "message_template": "Custom message"}. Operators: equals, not_equals, contains, not_contains, empty, not_empty, regex, gt, lt, gte, lte.',
        params: '{"field": "active", "operator": "equals", "expected": "false"}',
        script: 'var field = params.field;\nif (!field) return issues;\n\nvar value = item.values && item.values[field];\nvar operator = params.operator || \'equals\';\nvar expected = params.expected;\nvar recordName = item.values.name || item.values.title || \'Record\';\n\nvar condition = false;\nvar actualStr = String(value || \'\');\nvar expectedStr = String(expected || \'\');\n\nswitch(operator) {\n    case \'equals\':\n        condition = actualStr === expectedStr;\n        break;\n    case \'not_equals\':\n        condition = actualStr !== expectedStr;\n        break;\n    case \'contains\':\n        condition = actualStr.indexOf(expectedStr) !== -1;\n        break;\n    case \'not_contains\':\n        condition = actualStr.indexOf(expectedStr) === -1;\n        break;\n    case \'empty\':\n        condition = !value || value === \'\';\n        break;\n    case \'not_empty\':\n        condition = value && value !== \'\';\n        break;\n    case \'regex\':\n        try {\n            var regex = new RegExp(expectedStr);\n            condition = regex.test(actualStr);\n        } catch(e) {\n            gs.warn(\'[field_check] Invalid regex: \' + expectedStr);\n            return issues;\n        }\n        break;\n    case \'gt\':\n        condition = parseFloat(value) > parseFloat(expected);\n        break;\n    case \'lt\':\n        condition = parseFloat(value) < parseFloat(expected);\n        break;\n    case \'gte\':\n        condition = parseFloat(value) >= parseFloat(expected);\n        break;\n    case \'lte\':\n        condition = parseFloat(value) <= parseFloat(expected);\n        break;\n    default:\n        gs.warn(\'[field_check] Unknown operator: \' + operator);\n        return issues;\n}\n\nif (condition) {\n    var message = params.message_template || \n        \'Field "\' + field + \'" \' + operator + \' "\' + expectedStr + \'" in "\' + recordName + \'"\';\n    \n    issues.push({\n        code: rule.code,\n        message: message,\n        severity: rule.severity || \'medium\',\n        details: {\n            field: field,\n            operator: operator,\n            expected: expectedStr,\n            actual: actualStr,\n            record_table: item.table,\n            record_sys_id: item.sys_id,\n            record_name: recordName\n        }\n    });\n}\nreturn issues;'
    });
    
    handlers.push({
        name: 'Pattern Scan Handler',
        code: 'pattern_scan',
        type: 'pattern_scan',
        severity: 'medium',
        description: 'Scans specified fields for regex patterns. Use params {"fields": "script,comments", "pattern": "eval\\\\(", "message_template": "Dangerous eval() detected"}.',
        params: '{"fields": "script", "pattern": "eval\\\\("}',
        script: 'if (!params.pattern) return issues;\n\nvar pattern = params.pattern;\nvar fields = (params.fields || \'\').split(\',\').map(function(f){ return (f || \'\').trim(); }).filter(function(f){ return !!f; });\nvar recordName = item.values.name || item.values.title || \'Record\';\n\ntry {\n    var regex = new RegExp(pattern, \'i\');\n    \n    for (var i = 0; i < fields.length; i++) {\n        var field = fields[i];\n        var value = item.values && item.values[field];\n        if (!value || typeof value !== \'string\') continue;\n        \n        var match = value.match(regex);\n        if (match) {\n            var message = params.message_template || \n                \'Pattern "\' + pattern + \'" found in field "\' + field + \'" of "\' + recordName + \'"\';\n            \n            issues.push({\n                code: rule.code,\n                message: message,\n                severity: rule.severity || \'medium\',\n                details: {\n                    field: field,\n                    pattern: pattern,\n                    match: match[0],\n                    record_table: item.table,\n                    record_sys_id: item.sys_id,\n                    record_name: recordName\n                }\n            });\n            return issues;\n        }\n    }\n} catch(e) {\n    gs.warn(\'[pattern_scan] Invalid regex: \' + pattern + \' - \' + e.message);\n}\n\nreturn issues;'
    });
    
    handlers.push({
        name: 'Aggregate Metric Handler',
        code: 'aggregate_metric',
        type: 'aggregate_metric',
        severity: 'medium',
        description: 'Customizable aggregate handler. Use params {"metric": "count", "threshold": 50, "operator": "gt", "message_template": "Too many items"}. Currently supports metric=count only.',
        params: '{"metric": "count", "threshold": 50, "operator": "gt"}',
        script: 'var metric = params.metric || \'count\';\nvar threshold = params.threshold;\nvar operator = params.operator || \'gt\';\n\nif (!context) context = {};\nif (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};\nvar key = \'aggregate_metric_\' + rule.code;\nif (context._aggregateIssuesFired[key]) return issues;\n\nvar value = 0;\nvar count = context && context.totalCount || 0;\n\nif (metric === \'count\') {\n    value = count;\n} else {\n    gs.warn(\'[aggregate_metric] Metrics other than count require engine support\');\n    return issues;\n}\n\nvar condition = false;\nswitch(operator) {\n    case \'gt\': condition = value > threshold; break;\n    case \'lt\': condition = value < threshold; break;\n    case \'gte\': condition = value >= threshold; break;\n    case \'lte\': condition = value <= threshold; break;\n    case \'equals\': condition = value === threshold; break;\n}\n\nif (condition) {\n    context._aggregateIssuesFired[key] = true;\n    \n    var message = params.message_template || \n        metric.toUpperCase() + \' \' + operator + \' threshold (\' + value + \' \' + operator + \' \' + threshold + \')\';\n    \n    issues.push({\n        code: rule.code,\n        message: message,\n        severity: rule.severity || \'medium\',\n        details: {\n            metric: metric,\n            value: value,\n            threshold: threshold,\n            operator: operator\n        }\n    });\n}\n\nreturn issues;'
    });
    
    // ============= SIMPLE FLAG-BASED HANDLERS =============
    // These handlers check for boolean flags set by verification items
    
    var simpleHandlers = [
        {name: 'Risky Field Handler', code: 'risky_field', flag: 'risky_field', message: 'Risky field content', severity: 'high', description: 'Detects risky field content. Verification item must set risky_field=true.'},
        {name: 'Public Endpoint Handler', code: 'public_endpoint', flag: 'public_endpoint', message: 'Public endpoint without auth/rate limit', severity: 'high', description: 'Identifies public endpoints without authentication or rate limiting.'},
        {name: 'Public Access Handler', code: 'public_access', flag: 'public_access', message: 'Guest/public access detected', severity: 'high', description: 'Detects guest or public access configurations.'},
        {name: 'Heavy Business Rule Handler', code: 'br_heavy', flag: 'heavy_br', message: 'Heavy Business Rule', severity: 'medium', description: 'Identifies business rules with performance issues.'},
        {name: 'Heavy Client Script Handler', code: 'cs_heavy', flag: 'heavy_cs', message: 'Heavy Client Script', severity: 'medium', description: 'Identifies client scripts with performance issues.'},
        {name: 'UI Action Handler', code: 'ui_action', flag: 'ui_action_server', message: 'Server UI Action without need', severity: 'low', description: 'Detects server-side UI Actions that could be client-side.'},
        {name: 'Job Error Handler', code: 'job_error', flag: 'job_error', message: 'Scheduled job errors', severity: 'high', description: 'Detects scheduled jobs with execution errors.'},
        {name: 'Job Inactive Handler', code: 'job_inactive', flag: 'job_inactive', message: 'Scheduled job inactive', severity: 'low', description: 'Identifies inactive scheduled jobs.'},
        {name: 'Flow Error Handler', code: 'flow_error', flag: 'flow_error', message: 'Flow in error', severity: 'high', description: 'Detects flows with execution errors.'},
        {name: 'Flow Config Handler', code: 'flow_config', flag: 'flow_no_timeout', message: 'Flow missing timeout/retry', severity: 'medium', description: 'Identifies flows without timeout or retry configuration.'},
        {name: 'Notification Handler', code: 'notification', flag: 'notification_spam', message: 'Notification spam risk', severity: 'medium', description: 'Detects notifications that may cause spam.'},
        {name: 'Integration Error Handler', code: 'integration_error', flag: 'integration_error', message: 'Integration errors detected', severity: 'high', description: 'Identifies integrations with execution errors.'},
        {name: 'Integration Config Handler', code: 'integration_config', flag: 'integration_no_retry', message: 'Integration missing retry/backoff', severity: 'medium', description: 'Detects integrations without retry or backoff configuration.'},
        {name: 'Widget Performance Handler', code: 'widget_perf', flag: 'widget_no_cache', message: 'Widget/portal without cache/pagination', severity: 'medium', description: 'Identifies widgets without caching or pagination.'},
        {name: 'Query Scan Handler', code: 'query_scan', flag: 'full_table_scan', message: 'Full table scan detected', severity: 'high', description: 'Detects queries causing full table scans.'},
        {name: 'Script Weight Handler', code: 'script_weight', flag: 'heavy_script', message: 'Heavy server script', severity: 'medium', description: 'Identifies server scripts with performance issues.'},
        {name: 'Audit Handler', code: 'audit', flag: 'audit_disabled', message: 'Audit disabled on sensitive table', severity: 'high', description: 'Detects audit disabled on sensitive tables.'},
        {name: 'Security Handler', code: 'security', flag: 'security_risk', message: 'Security risk detected', severity: 'high', description: 'Identifies general security risks.'},
        {name: 'Catalog Handler', code: 'catalog', flag: 'catalog_risk', message: 'Catalog item risk', severity: 'medium', description: 'Detects catalog items with configuration risks.'},
        {name: 'Mail Config Handler', code: 'mail_config', flag: 'mail_no_restriction', message: 'Mail not restricted', severity: 'medium', description: 'Identifies mail configurations without restrictions.'},
        {name: 'Observability Handler', code: 'observability', flag: 'no_metrics', message: 'No metrics/logs on critical component', severity: 'medium', description: 'Detects critical components without metrics or logging.'}
    ];
    
    simpleHandlers.forEach(function(h) {
        handlers.push({
            name: h.name,
            code: h.code,
            type: h.code,
            severity: h.severity,
            description: h.description,
            params: '{}',
            script: 'if (item.values && item.values.' + h.flag + ' === \'true\') {\n    issues.push({\n        code: rule.code,\n        message: \'' + h.message + '\',\n        severity: rule.severity || \'' + h.severity + '\',\n        details: {}\n    });\n}\nreturn issues;'
        });
    });
    
    // ============= CREATE RECORDS =============
    
    gs.info('====================================');
    gs.info('Starting handler migration to table: ' + tableName);
    gs.info('Total handlers to create: ' + handlers.length);
    gs.info('====================================');
    
    var created = 0;
    var updated = 0;
    var errors = 0;
    
    handlers.forEach(function(handler) {
        try {
            var gr = new GlideRecord(tableName);
            gr.addQuery('code', handler.code);
            gr.query();
            
            if (gr.next()) {
                // Update existing
                gr.setValue('name', handler.name);
                gr.setValue('type', handler.type);
                gr.setValue('severity', handler.severity);
                gr.setValue('description', handler.description);
                gr.setValue('params', handler.params);
                gr.setValue('script', handler.script);
                gr.setValue('active', true);
                gr.update();
                updated++;
                gs.info('[UPDATED] ' + handler.code + ' - ' + handler.name);
            } else {
                // Create new
                gr.initialize();
                gr.setValue('name', handler.name);
                gr.setValue('code', handler.code);
                gr.setValue('type', handler.type);
                gr.setValue('severity', handler.severity);
                gr.setValue('description', handler.description);
                gr.setValue('params', handler.params);
                gr.setValue('script', handler.script);
                gr.setValue('active', true);
                gr.insert();
                created++;
                gs.info('[CREATED] ' + handler.code + ' - ' + handler.name);
            }
        } catch(e) {
            errors++;
            gs.error('[ERROR] Failed to process handler: ' + handler.code + ' - ' + e.message);
        }
    });
    
    gs.info('====================================');
    gs.info('Migration complete!');
    gs.info('Created: ' + created);
    gs.info('Updated: ' + updated);
    gs.info('Errors: ' + errors);
    gs.info('Total: ' + (created + updated + errors) + ' / ' + handlers.length);
    gs.info('====================================');
    gs.info('');
    gs.info('Next step: Update the FHARuleEvaluator script include to load handlers from this table.');
    gs.info('====================================');
    
})();
