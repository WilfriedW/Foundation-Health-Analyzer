/**
 * DEBUG TEST SCRIPT - Foundation Health Analyzer
 * Execute this in ServiceNow Background Script
 *
 * This will help identify where the analysis is failing
 */

(function() {
    gs.info('========================================');
    gs.info('🔍 STARTING DEBUG TEST');
    gs.info('========================================');

    // ===== STEP 1: Find or create a test configuration =====
    gs.info('\n📋 STEP 1: Loading configuration...');

    var configGr = new GlideRecord('x_1310794_founda_0_configurations');
    configGr.addQuery('active', true);
    configGr.orderByDesc('sys_created_on');
    configGr.setLimit(1);
    configGr.query();

    if (!configGr.next()) {
        gs.error('❌ No active configuration found!');
        gs.error('Please create a configuration first');
        return;
    }

    var configSysId = configGr.getUniqueValue();
    gs.info('✅ Configuration found: ' + configGr.getValue('name'));
    gs.info('   - sys_id: ' + configSysId);
    gs.info('   - table: ' + configGr.table.name);
    gs.info('   - use_template: ' + configGr.getValue('use_template'));
    gs.info('   - template: ' + configGr.getValue('template'));
    gs.info('   - verification_items: ' + configGr.getValue('verification_items'));

    // ===== STEP 2: Test getConfiguration =====
    gs.info('\n📋 STEP 2: Testing getConfiguration()...');

    var analyzer = new x_1310794_founda_0.FHAnalyzer();
    var config = analyzer.getConfiguration(configSysId);

    if (!config) {
        gs.error('❌ getConfiguration() returned null!');
        return;
    }

    gs.info('✅ Configuration loaded:');
    gs.info('   - sys_id: ' + config.sys_id);
    gs.info('   - name: ' + config.name);
    gs.info('   - table_name: ' + config.table_name);
    gs.info('   - verification_items count: ' + (config.verification_items ? config.verification_items.length : 0));

    if (!config.verification_items || config.verification_items.length === 0) {
        gs.error('❌ No verification items found!');
        gs.error('Check that:');
        gs.error('  1. If use_template=true, the template has verification_items');
        gs.error('  2. If use_template=false, the config has verification_items');
        return;
    }

    gs.info('\n📝 Verification Items:');
    config.verification_items.forEach(function(vi, idx) {
        gs.info('   [' + (idx + 1) + '] ' + vi.name);
        gs.info('       - sys_id: ' + vi.sys_id);
        gs.info('       - category: ' + vi.category);
        gs.info('       - table: ' + vi.tableName);
        gs.info('       - query_type: ' + vi.query_type);
        gs.info('       - query_value: ' + vi.query_value);
        gs.info('       - issue_rules: ' + vi.issue_rules);
    });

    // ===== STEP 3: Test FHAnalysisEngine =====
    gs.info('\n📋 STEP 3: Testing FHAnalysisEngine.runVerification()...');

    var engine = new x_1310794_founda_0.FHAnalysisEngine();
    var engineResult = engine.runVerification(config);

    gs.info('✅ Engine completed:');
    gs.info('   - success: ' + engineResult.success);
    gs.info('   - errors: ' + JSON.stringify(engineResult.errors));
    gs.info('   - data count: ' + (engineResult.data ? engineResult.data.length : 0));
    gs.info('   - issues count: ' + (engineResult.issues ? engineResult.issues.length : 0));
    gs.info('   - health_score: ' + engineResult.health_score);
    gs.info('   - issues_high: ' + engineResult.issues_high);
    gs.info('   - issues_medium: ' + engineResult.issues_medium);
    gs.info('   - issues_low: ' + engineResult.issues_low);
    gs.info('   - record_count: ' + engineResult.record_count);

    if (engineResult.errors && engineResult.errors.length > 0) {
        gs.error('\n❌ Errors found:');
        engineResult.errors.forEach(function(err) {
            gs.error('   - ' + err);
        });
    }

    if (engineResult.issues && engineResult.issues.length > 0) {
        gs.info('\n📊 Issues found:');
        engineResult.issues.slice(0, 5).forEach(function(issue, idx) {
            gs.info('   [' + (idx + 1) + '] ' + issue.code + ' - ' + issue.severity);
            gs.info('       Message: ' + issue.message);
            gs.info('       Record: ' + issue.record_table + ' / ' + issue.record_sys_id);
        });
        if (engineResult.issues.length > 5) {
            gs.info('   ... and ' + (engineResult.issues.length - 5) + ' more');
        }
    }

    // ===== STEP 4: Test _buildResultStructure =====
    gs.info('\n📋 STEP 4: Testing _buildResultStructure()...');

    var structuredResult = analyzer._buildResultStructure(config, engineResult);

    gs.info('✅ Structured result:');
    gs.info('   Configuration:');
    gs.info('     - sys_id: ' + structuredResult.configuration.sys_id);
    gs.info('     - name: ' + structuredResult.configuration.name);
    gs.info('     - verification_items: ' + structuredResult.configuration.verification_items.length);
    gs.info('   Result:');
    gs.info('     - success: ' + structuredResult.result.success);
    gs.info('     - health_score: ' + structuredResult.result.health_score);
    gs.info('     - issue_count: ' + structuredResult.result.issue_count);
    gs.info('     - record_count: ' + structuredResult.result.record_count);

    // ===== STEP 5: Test full runAnalysis =====
    gs.info('\n📋 STEP 5: Testing full runAnalysis()...');

    var result = analyzer.runAnalysis(configSysId);

    gs.info('✅ Analysis result:');
    gs.info('   - success: ' + result.success);
    gs.info('   - analysis_id: ' + result.analysis_id);
    gs.info('   - details: ' + (result.details ? 'present' : 'MISSING'));

    if (result.details) {
        gs.info('\n📊 Details structure:');
        gs.info('   - configuration: ' + (result.details.configuration ? 'present' : 'MISSING'));
        gs.info('   - result: ' + (result.details.result ? 'present' : 'MISSING'));

        if (result.details.result) {
            gs.info('\n   Result metrics:');
            gs.info('     - health_score: ' + result.details.result.health_score);
            gs.info('     - issues_high: ' + result.details.result.issues_high);
            gs.info('     - issues_medium: ' + result.details.result.issues_medium);
            gs.info('     - issues_low: ' + result.details.result.issues_low);
            gs.info('     - issue_count: ' + result.details.result.issue_count);
            gs.info('     - record_count: ' + result.details.result.record_count);
            gs.info('     - issues array: ' + (result.details.result.issues ? result.details.result.issues.length : 0));
        }
    }

    // ===== STEP 6: Check saved result in DB =====
    gs.info('\n📋 STEP 6: Checking saved result in database...');

    var resultGr = new GlideRecord('x_1310794_founda_0_results');
    if (resultGr.get(result.analysis_id)) {
        gs.info('✅ Result saved in database:');
        gs.info('   - number: ' + resultGr.getValue('number'));
        gs.info('   - state: ' + resultGr.getValue('state'));
        gs.info('   - details length: ' + (resultGr.getValue('details') ? resultGr.getValue('details').length : 0) + ' chars');

        try {
            var savedDetails = JSON.parse(resultGr.getValue('details'));
            gs.info('   - JSON parsed: ✅');
            gs.info('   - configuration present: ' + (savedDetails.configuration ? '✅' : '❌'));
            gs.info('   - result present: ' + (savedDetails.result ? '✅' : '❌'));

            if (savedDetails.result) {
                gs.info('   - health_score: ' + savedDetails.result.health_score);
                gs.info('   - issue_count: ' + savedDetails.result.issue_count);
            }
        } catch (e) {
            gs.error('❌ Failed to parse JSON: ' + e.message);
        }
    } else {
        gs.error('❌ Result not found in database!');
    }

    // ===== FINAL SUMMARY =====
    gs.info('\n========================================');
    gs.info('✅ DEBUG TEST COMPLETED');
    gs.info('========================================');
    gs.info('Result sys_id: ' + result.analysis_id);
    gs.info('View result: /x_1310794_founda_0_results.do?sys_id=' + result.analysis_id);

})();
