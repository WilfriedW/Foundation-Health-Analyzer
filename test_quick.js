/**
 * QUICK TEST - Run analysis and show result
 * Copy-paste this in ServiceNow Background Script
 */

// 1. Find first active configuration
var configGr = new GlideRecord('x_1310794_founda_0_configurations');
configGr.addQuery('active', true);
configGr.setLimit(1);
configGr.query();

if (!configGr.next()) {
    gs.error('No configuration found');
} else {
    gs.info('Using config: ' + configGr.getValue('name'));

    // 2. Run analysis
    var analyzer = new x_1310794_founda_0.FHAnalyzer();
    var result = analyzer.runAnalysis(configGr.getUniqueValue());

    // 3. Show result
    gs.info('\n=== RESULT ===');
    gs.info('Success: ' + result.success);
    gs.info('Analysis ID: ' + result.analysis_id);
    gs.info('Details: ' + JSON.stringify(result.details, null, 2));
}
