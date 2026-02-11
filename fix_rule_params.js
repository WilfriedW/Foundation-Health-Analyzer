/**
 * FIX RULE PARAMS - Fix the hardcoded_sysID rule params
 */

(function() {
    gs.info('========================================');
    gs.info('🔧 FIXING RULE PARAMS');
    gs.info('========================================');

    var ruleGr = new GlideRecord('x_1310794_founda_0_issue_rules');
    ruleGr.addQuery('code', 'hardcoded_sysID');
    ruleGr.query();

    if (!ruleGr.next()) {
        gs.error('❌ Rule hardcoded_sysID not found');
        return;
    }

    gs.info('✅ Found rule: ' + ruleGr.getValue('name'));
    gs.info('   Current params: ' + ruleGr.getValue('params'));
    gs.info('   Current severity: ' + ruleGr.getValue('severity'));

    // Fix params to valid JSON
    var newParams = {
        fields: 'script'
    };

    ruleGr.setValue('params', JSON.stringify(newParams));

    // Set severity if null
    if (!ruleGr.getValue('severity')) {
        ruleGr.setValue('severity', 'high');
        gs.info('   Setting severity to: high');
    }

    ruleGr.update();

    gs.info('\n✅ Rule updated!');
    gs.info('   New params: ' + ruleGr.getValue('params'));
    gs.info('   New severity: ' + ruleGr.getValue('severity'));

    gs.info('\n========================================');
    gs.info('✅ FIX COMPLETED - You can now run test_rule_evaluator.js again');
    gs.info('========================================');

})();
