/**
 * COMPLETE RULE TEST - Creates test record with hardcoded sys_id
 */

(function() {
    gs.info('========================================');
    gs.info('🔍 COMPLETE RULE TEST');
    gs.info('========================================');

    // Step 1: Check rule params
    gs.info('\n[STEP 1] Checking rule configuration...');
    var ruleGr = new GlideRecord('x_1310794_founda_0_issue_rules');
    ruleGr.addQuery('code', 'hardcoded_sysID');
    ruleGr.query();

    if (!ruleGr.next()) {
        gs.error('❌ Rule not found');
        return;
    }

    gs.info('✅ Rule: ' + ruleGr.getValue('name'));
    gs.info('   Code: ' + ruleGr.getValue('code'));
    gs.info('   Params: ' + ruleGr.getValue('params'));
    gs.info('   Severity: ' + ruleGr.getValue('severity'));

    // Validate params is valid JSON
    var paramsStr = ruleGr.getValue('params');
    var paramsObj = null;
    try {
        paramsObj = JSON.parse(paramsStr);
        gs.info('   ✅ Params is valid JSON');
        gs.info('   Parsed params.fields: ' + paramsObj.fields);
    } catch (e) {
        gs.error('   ❌ Params is NOT valid JSON: ' + e.message);
        gs.error('   Please run fix_rule_params.js first');
        return;
    }

    // Step 2: Get the rule script
    gs.info('\n[STEP 2] Checking rule script...');
    var script = ruleGr.getValue('script');
    if (!script) {
        gs.error('❌ Rule has no script');
        return;
    }
    gs.info('✅ Rule has script (' + script.length + ' chars)');

    // Step 3: Create or find test record with hardcoded sys_id
    gs.info('\n[STEP 3] Creating test record...');

    var testGr = new GlideRecord('sys_script_client');
    testGr.initialize();
    testGr.setValue('name', 'TEST - Hardcoded SysID Detection');
    testGr.setValue('table', 'incident');
    testGr.setValue('active', false);
    // Create a script with a hardcoded sys_id
    testGr.setValue('script',
        'var gr = new GlideRecord("sys_user");\n' +
        'gr.get("a1b2c3d4e5f6789012345678901234ab"); // Hardcoded sys_id\n' +
        'gs.info("User: " + gr.name);'
    );
    var testSysId = testGr.insert();

    gs.info('✅ Created test record: ' + testSysId);
    gs.info('   Table: ' + testGr.getTableName());
    gs.info('   Script contains: a1b2c3d4e5f6789012345678901234ab');

    // Step 4: Build rule object
    gs.info('\n[STEP 4] Building rule object...');
    var ruleObj = {
        sys_id: ruleGr.getUniqueValue(),
        code: ruleGr.getValue('code'),
        name: ruleGr.getValue('name'),
        severity: ruleGr.getValue('severity') || 'high',
        message_template: ruleGr.getValue('message_template'),
        table: ruleGr.getValue('table'),
        script: script,
        params: paramsStr
    };
    gs.info('✅ Rule object built');

    // Step 5: Test evaluator
    gs.info('\n[STEP 5] Testing FHARuleEvaluator...');

    var evaluator = new x_1310794_founda_0.FHARuleEvaluator();
    var context = {};
    var issues = evaluator.evaluate(testGr, [ruleObj], context);

    // Step 6: Results
    gs.info('\n========================================');
    gs.info('📊 RESULTS');
    gs.info('========================================');
    gs.info('Issues found: ' + issues.length);

    if (issues.length > 0) {
        gs.info('✅ SUCCESS - Hardcoded sys_id detected!');
        issues.forEach(function(issue, idx) {
            gs.info('\n[Issue #' + (idx + 1) + ']');
            gs.info('  Code: ' + issue.code);
            gs.info('  Message: ' + issue.message);
            gs.info('  Severity: ' + issue.severity);
            if (issue.details) {
                gs.info('  Details:');
                for (var key in issue.details) {
                    gs.info('    - ' + key + ': ' + issue.details[key]);
                }
            }
        });
    } else {
        gs.error('❌ FAILURE - No issues detected');
        gs.error('Expected to find hardcoded sys_id: a1b2c3d4e5f6789012345678901234ab');
        gs.error('');
        gs.error('Possible causes:');
        gs.error('1. Rule script has a bug');
        gs.error('2. params.fields does not include "script"');
        gs.error('3. Rule is not checking the right field');
    }

    // Cleanup
    gs.info('\n[CLEANUP] Deleting test record...');
    testGr.deleteRecord();
    gs.info('✅ Test record deleted');

    gs.info('\n========================================');
    gs.info('✅ TEST COMPLETED');
    gs.info('========================================');

})();
