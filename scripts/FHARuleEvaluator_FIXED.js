// =====================================================================
// SCRIPT: FHARuleEvaluator - Fixed Version for Scoped App
// =====================================================================
// Description: Uses GlideScopedEvaluator instead of eval()
// Date: 2026-01-18
// =====================================================================

var FHARuleEvaluator = Class.create();
FHARuleEvaluator.prototype = {
    initialize: function() {
        // Initialization
    },

    /**
     * Evaluates rules for a given item
     * @param {Object} item - The record to evaluate
     * @param {Array} rules - The rules to apply
     * @param {Object} context - Shared context (for aggregation, etc.)
     * @returns {Array} - List of detected issues
     */
    evaluate: function(item, rules, context) {
        var allIssues = [];
        
        if (!rules || !Array.isArray(rules)) {
            return allIssues;
        }
        
        var self = this;
        
        rules.forEach(function(rule) {
            try {
                var issues = [];
                
                // Parse JSON params
                var params = {};
                try {
                    if (rule.params) {
                        params = JSON.parse(rule.params);
                    }
                } catch (parseError) {
                    gs.error("[FHARuleEvaluator] Error parsing params for rule " + rule.code + ": " + parseError.message);
                }
                
                // Execute the rule script
                if (rule.script) {
                    issues = self._runScriptSafe(rule, item, params, context);
                }
                
                // Add found issues
                if (issues && Array.isArray(issues)) {
                    allIssues = allIssues.concat(issues);
                }
                
            } catch (error) {
                gs.error("[FHARuleEvaluator] Error evaluating rule " + rule.code + ": " + error.message);
            }
        });
        
        return allIssues;
    },

    /**
     * Executes a rule script safely (Scoped App compatible)
     * @param {Object} rule - The rule
     * @param {Object} item - The item to evaluate
     * @param {Object} params - The rule parameters
     * @param {Object} context - The context
     * @returns {Array} - Detected issues
     */
    _runScriptSafe: function(rule, item, params, context) {
        var issues = [];
        
        try {
            // ============================================================
            // SMART WRAPPER: Detect if script is already wrapped
            // ============================================================
            var scriptToExecute = rule.script;
            var isWrapped = this._isScriptWrapped(rule.script);
            
            if (!isWrapped) {
                // Wrap the script automatically
                scriptToExecute = this._wrapScript(rule.script, rule.code);
                gs.debug("[FHARuleEvaluator] Auto-wrapped script for rule: " + rule.code);
            } else {
                gs.debug("[FHARuleEvaluator] Script already wrapped for rule: " + rule.code);
            }
            
            // ============================================================
            // USE GlideScopedEvaluator (Scoped App Safe)
            // ============================================================
            var evaluator = new GlideScopedEvaluator();
            
            // Define variables available in the script
            evaluator.putVariable('item', item);
            evaluator.putVariable('params', params);
            evaluator.putVariable('context', context);
            evaluator.putVariable('rule', rule);
            evaluator.putVariable('issues', issues);
            evaluator.putVariable('gs', gs);
            
            // Execute the script (wrapped or not)
            var result = evaluator.evaluateScript(scriptToExecute, 'javascript');
            
            // Get the result
            // Script can return issues via 'return' or modify 'issues' directly
            if (result && Array.isArray(result)) {
                issues = result;
            } else {
                issues = evaluator.getVariable('issues');
            }
            
            // Validate the result
            if (!issues || !Array.isArray(issues)) {
                issues = [];
            }
            
        } catch (scriptError) {
            gs.error("[FHARuleEvaluator] Script error for rule " + rule.code + ": " + scriptError.message);
            gs.error("[FHARuleEvaluator] Script content: " + rule.script);
            
            // Create an issue to report the script error
            issues.push({
                code: 'SCRIPT_ERROR',
                message: 'Error executing rule ' + rule.code + ': ' + scriptError.message,
                severity: 'high',
                details: {
                    rule_code: rule.code,
                    error: scriptError.message,
                    recommendation: 'Check the rule script for syntax errors'
                }
            });
        }
        
        return issues;
    },
    
    /**
     * Checks if a script is already wrapped in a function
     * @param {String} script - The script to check
     * @returns {Boolean} - True if already wrapped
     */
    _isScriptWrapped: function(script) {
        if (!script) return false;
        
        var trimmed = script.trim();
        
        // Check if starts with (function and ends with })(); or }).call() or }).apply()
        var startsWithFunction = trimmed.indexOf('(function') === 0;
        var endsWithExecution = 
            trimmed.lastIndexOf('})();') === trimmed.length - 5 ||
            trimmed.lastIndexOf('}).call') !== -1 ||
            trimmed.lastIndexOf('}).apply') !== -1;
        
        return startsWithFunction && endsWithExecution;
    },
    
    /**
     * Wraps a script in a function to allow return statements
     * @param {String} script - The script to wrap
     * @param {String} ruleCode - The rule code (for error messages)
     * @returns {String} - The wrapped script
     */
    _wrapScript: function(script, ruleCode) {
        return '(function() {\n' +
               '    try {\n' +
               '        ' + script.split('\n').join('\n        ') + '\n' +
               '        return issues;\n' +
               '    } catch (e) {\n' +
               '        gs.error("[Rule Script] Error in ' + ruleCode + ': " + e.message);\n' +
               '        return issues;\n' +
               '    }\n' +
               '})();';
    },

    type: 'FHARuleEvaluator'
};
