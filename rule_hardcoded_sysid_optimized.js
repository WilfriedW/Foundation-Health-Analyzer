/**
 * OPTIMIZED RULE: Hardcoded sys_id detection
 * Detects 32-character hexadecimal strings (sys_ids) hardcoded in specified fields
 */
(function executeRule(item, context, issues) {

    // Regex for 32-char hex strings (sys_ids)
    var sysIdRegex = /[0-9a-f]{32}/ig;

    // Parse fields to check from params
    if (!params || !params.fields) {
        gs.warn('[Rule:hardcoded_sysID] No fields specified in params');
        return;
    }

    var fieldNames = params.fields.split(',').map(function(f) {
        return f.trim();
    }).filter(function(f) {
        return f.length > 0;
    });

    if (fieldNames.length === 0) {
        gs.warn('[Rule:hardcoded_sysID] No valid fields after parsing params.fields');
        return;
    }

    // Get record display name
    var recordName = item.values.name || item.values.title || item.values.sys_id || 'Record';

    // Scan specified fields for hardcoded sys_ids
    var hits = [];
    var totalMatches = 0;

    for (var i = 0; i < fieldNames.length; i++) {
        var fieldName = fieldNames[i];
        var fieldValue = item.values[fieldName];

        // Skip if field doesn't exist or isn't a string
        if (!fieldValue || typeof fieldValue !== 'string') {
            continue;
        }

        // Find all sys_id matches in this field
        var matches = fieldValue.match(sysIdRegex);
        if (matches && matches.length > 0) {
            hits.push({
                field: fieldName,
                matches: matches,
                count: matches.length
            });
            totalMatches += matches.length;
        }
    }

    // If hardcoded sys_ids found, create issue
    if (hits.length > 0) {
        var fieldsList = hits.map(function(h) {
            return h.field + ' (' + h.count + ')';
        });

        var message = 'Hardcoded sys_id(s) detected in "' + recordName + '": ' +
                      totalMatches + ' occurrence(s) in fields [' + fieldsList.join(', ') + ']. ' +
                      'Replace with dynamic queries.';

        issues.push({
            code: rule.code,
            message: message,
            severity: rule.severity || 'high',
            record: item.sys_id,
            record_table: item.table,
            record_sys_id: item.sys_id,
            details: {
                hits: hits,
                total_sys_ids: totalMatches,
                fields: fieldsList,
                record_name: recordName,
                recommendation: 'Replace hardcoded sys_ids with dynamic queries using names or other unique fields'
            }
        });
    }

})(item, context, issues);
