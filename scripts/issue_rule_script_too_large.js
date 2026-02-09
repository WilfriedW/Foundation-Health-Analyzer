// =====================================================================
// ISSUE RULE: SCRIPT_TOO_LARGE (BR_HEAVY / CS_HEAVY)
// =====================================================================
// Description: Detects scripts that are too large (lines or characters)
// Type: script_too_large
// Severity: medium (high if > high_threshold)
// =====================================================================

// Parameters (configurable via rule params JSON):
// {
//     "line_threshold": 100,      // Warning if > 100 lines
//     "char_threshold": 2000,     // Warning if > 2000 chars
//     "high_threshold": 200,      // High severity if > 200 lines
//     "script_field": "script"    // Field to check (default: script)
// }

// =====================================================================
// SCRIPT (WITH WRAPPER)
// =====================================================================

(function executeRule() {
    // Get thresholds from params or use defaults
    var lineThreshold = params.line_threshold || 100;
    var charThreshold = params.char_threshold || 2000;
    var highThreshold = params.high_threshold || 200;

    // Get script field (can be 'script', 'script_true', 'script_false', etc.)
    var scriptField = params.script_field || 'script';
    var scriptContent = item.values[scriptField] || '';

    // Early exit if no script
    if (!scriptContent || scriptContent.trim() === '') return issues;

// Count lines and characters
var lines = scriptContent.split('\n');
var lineCount = lines.length;
var charCount = scriptContent.length;

// Check if exceeds thresholds
if (lineCount > lineThreshold || charCount > charThreshold) {
    var recordName = item.values.name || 'Script';
    
    // Determine severity based on size
    var severity = rule.severity || 'medium';
    if (lineCount > highThreshold) {
        severity = 'high';
    }
    
    // Calculate non-empty lines (exclude comments and blank lines)
    var nonEmptyLines = 0;
    var commentLines = 0;
    lines.forEach(function(line) {
        var trimmed = line.trim();
        if (trimmed.length > 0) {
            nonEmptyLines++;
            if (trimmed.indexOf('//') === 0 || trimmed.indexOf('/*') === 0 || trimmed.indexOf('*') === 0) {
                commentLines++;
            }
        }
    });
    var codeLines = nonEmptyLines - commentLines;
    
    var message = 'Script too large for "' + recordName + '": ' + 
                  lineCount + ' lines (' + codeLines + ' code, ' + commentLines + ' comments), ' + 
                  charCount + ' characters. ' +
                  'Consider refactoring into Script Include.';
    
    issues.push({
        code: rule.code,
        message: message,
        severity: severity,
        details: {
            record_table: item.table,
            record_sys_id: item.sys_id,
            record_name: recordName,
            script_field: scriptField,
            total_lines: lineCount,
            code_lines: codeLines,
            comment_lines: commentLines,
            char_count: charCount,
            line_threshold: lineThreshold,
            char_threshold: charThreshold,
            high_threshold: highThreshold,
            recommendation: 'Refactor large scripts into reusable Script Includes for better maintainability, performance, and reusability. ' +
                          'Large scripts in Business Rules or Client Scripts can cause performance issues and are harder to maintain.'
        }
    });
    
    return issues;
})();

// =====================================================================
// USAGE EXAMPLES
// =====================================================================

// Example 1: Business Rule with default thresholds
// params: {}
// Detects BR > 100 lines or > 2000 chars

// Example 2: Client Script with custom thresholds
// params: {"line_threshold": 50, "char_threshold": 1000}
// Detects CS > 50 lines or > 1000 chars

// Example 3: UI Action script (different field)
// params: {"script_field": "script", "line_threshold": 80}
// Detects UI Action > 80 lines

// Example 4: Strict thresholds for critical tables
// params: {"line_threshold": 50, "char_threshold": 1000, "high_threshold": 100}
// Medium if > 50 lines, High if > 100 lines
