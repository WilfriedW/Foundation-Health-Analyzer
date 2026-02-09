// Create Configuration from Template
// Usage: Modify templateName and configName below, then run in Background Script

(function() {
    
    // === CONFIGURATION ===
    var templateName = 'Standard Business Rules Analysis'; // Template to use
    var configName = 'My BR Analysis'; // Name for new configuration
    var options = {
        deep_scan: false,
        ignore_servicenow_records: true,
        include_children_tables: false,
        include_ldap: false
    };
    // === END CONFIGURATION ===

    try {
        var mgr = new x_1310794_founda_0.FHTemplateManager();
        
        // Find template
        var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
        template.addQuery('name', templateName);
        template.addQuery('active', true);
        template.query();
        
        if (!template.next()) {
            gs.error('Template not found: ' + templateName);
            return;
        }
        
        // Create config
        var configId = mgr.createFromTemplate(template.sys_id.toString(), configName, options);
        
        gs.info('Configuration created successfully!');
        gs.info('Config ID: ' + configId);
        gs.info('Name: ' + configName);
        gs.info('URL: ' + gs.getProperty('glide.servlet.uri') + 'x_1310794_founda_0_configurations.do?sys_id=' + configId);
        
    } catch (e) {
        gs.error('Error creating configuration: ' + e);
    }
    
})();
