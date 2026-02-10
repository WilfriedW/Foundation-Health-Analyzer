/**
 * TEST RULE EVALUATOR - Test custom rule execution
 * This validates that FHARuleEvaluator properly passes params, rule, and item
 */

(function() {
    gs.info('========================================');
    gs.info('🔍 TESTING RULE EVALUATOR');
    gs.info('========================================');

    // Find a test record (sys_script_client as example)
    var testRecord = new GlideRecord('sys_script_client');
    testRecord.addQuery('active', true);
    testRecord.setLimit(1);
    testRecord.query();

    if (!testRecord.next()) {
        gs.error('❌ No test record found');
        return;
    }

    gs.info('✅ Test record: ' + testRecord.getValue('name'));
    gs.info('   Table: ' + testRecord.getTableName());
    gs.info('   sys_id: ' + testRecord.getUniqueValue());

    // Find hardcoded sys_id detection rule
    var ruleGr = new GlideRecord('x_1310794_founda_0_issue_rules');
    ruleGr.addQuery('code', 'HARDCODED_SYSID');
    ruleGr.addQuery('active', true);
    ruleGr.setLimit(1);
    ruleGr.query();

    if (!ruleGr.next()) {
        gs.error('❌ Rule HARDCODED_SYSID not found');
        gs.error('Please create this rule first with params: {"fields":"script"}');
        return;
    }

    gs.info('✅ Rule found: ' + ruleGr.getValue('name'));
    gs.info('   Code: ' + ruleGr.getValue('code'));
    gs.info('   Severity: ' + ruleGr.getValue('severity'));
    gs.info('   Params: ' + ruleGr.getValue('params'));

    // Build rule object (as FHAnalysisEngine would)
    var ruleObj = {
        sys_id: ruleGr.getUniqueValue(),
        code: ruleGr.getValue('code'),
        name: ruleGr.getValue('name'),
        severity: ruleGr.getValue('severity'),
        message_template: ruleGr.getValue('message_template'),
        table: ruleGr.getValue('table'),
        script: ruleGr.getValue('script'),
        params: ruleGr.getValue('params')
    };

    // Test FHARuleEvaluator
    gs.info('\n📋 Testing FHARuleEvaluator.evaluate()...');

    var evaluator = new x_1310794_founda_0.FHARuleEvaluator();
    var context = {};
    var issues = evaluator.evaluate(testRecord, [ruleObj], context);

    gs.info('\n========================================');
    gs.info('📊 RESULTS');
    gs.info('========================================');
    gs.info('Issues found: ' + issues.length);

    if (issues.length > 0) {
        issues.forEach(function(issue, idx) {
            gs.info('\n[Issue #' + (idx + 1) + ']');
            gs.info('  Code: ' + issue.code);
            gs.info('  Message: ' + issue.message);
            gs.info('  Severity: ' + issue.severity);
            gs.info('  Record: ' + issue.record_table + ' / ' + issue.record_sys_id);
            if (issue.details) {
                gs.info('  Details:');
                for (var key in issue.details) {
                    gs.info('    - ' + key + ': ' + issue.details[key]);
                }
            }
        });
    } else {
        gs.info('ℹ️ No issues detected (rule may not have found hardcoded sys_ids in this record)');
    }

    gs.info('\n========================================');
    gs.info('✅ TEST COMPLETED');
    gs.info('========================================');

})();
