/**
 * TEST VI LOADING - Debug verification items loading
 * This tests if VIs are loaded correctly from template or config
 */

(function() {
    gs.info('=== TESTING VI LOADING ===\n');

    // Get first config
    var configGr = new GlideRecord('x_1310794_founda_0_configurations');
    configGr.addQuery('active', true);
    configGr.setLimit(1);
    configGr.query();

    if (!configGr.next()) {
        gs.error('No config found');
        return;
    }

    var configSysId = configGr.getUniqueValue();
    var useTemplate = configGr.getValue('use_template');
    var templateId = configGr.getValue('template');
    var viList = configGr.getValue('verification_items');

    gs.info('Config: ' + configGr.getValue('name'));
    gs.info('use_template: ' + useTemplate);
    gs.info('template: ' + templateId);
    gs.info('verification_items (direct): ' + viList);

    // Test the logic
    var viIds = '';

    if (useTemplate == 'true' || useTemplate == true || useTemplate == 1) {
        gs.info('\n📌 Using TEMPLATE mode');
        if (templateId) {
            var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
            if (template.get(templateId)) {
                viIds = template.getValue('verification_items') || '';
                gs.info('Template found: ' + template.getValue('name'));
                gs.info('Template VIs: ' + viIds);
            } else {
                gs.error('Template not found: ' + templateId);
            }
        } else {
            gs.error('No template ID specified');
        }
    } else {
        gs.info('\n📌 Using DIRECT mode');
        viIds = viList || '';
        gs.info('Direct VIs: ' + viIds);
    }

    if (!viIds) {
        gs.error('\n❌ No VI IDs found!');
        return;
    }

    // Load VIs
    gs.info('\n📋 Loading VIs: ' + viIds);
    var viArray = viIds.split(',');
    gs.info('VI count: ' + viArray.length);

    var verificationItems = new GlideRecord('x_1310794_founda_0_verification_items');
    verificationItems.addQuery('sys_id', 'IN', viIds);
    verificationItems.addQuery('active', true);
    verificationItems.query();

    var count = 0;
    while (verificationItems.next()) {
        count++;
        gs.info('\n[' + count + '] ' + verificationItems.getValue('name'));
        gs.info('    sys_id: ' + verificationItems.getUniqueValue());
        gs.info('    table: ' + verificationItems.table.name);
        gs.info('    query_value: ' + verificationItems.getValue('query_value'));
        gs.info('    issue_rules: ' + verificationItems.getValue('issue_rules'));
    }

    gs.info('\n✅ Loaded ' + count + ' verification items');

})();
