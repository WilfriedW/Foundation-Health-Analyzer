// Example Usage v3 - Multi Verification Items with glide_list
// Background Script - Run in ServiceNow Scripts - Background

// ============================================
// EXAMPLE 1: Create Config with Full Template
// ============================================
(function example1_fullTemplate() {
    
    gs.info('=== EXAMPLE 1: Full Template ===');
    
    var mgr = new x_1310794_founda_0.FHTemplateManager();
    
    // Get template
    var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
    if (!template.get('name', 'Complete Table Health Check')) {
        gs.error('Template not found');
        return;
    }
    
    // Create config with full template
    var configId = mgr.createFromTemplate(
        template.sys_id.toString(),
        'Users - Complete Health Check',
        'sys_user',  // Target table
        {
            ignore_servicenow_records: true,
            deep_scan: false
        }
    );
    
    gs.info('✅ Configuration created: ' + configId);
    
    // Check what was created
    var config = new GlideRecord('x_1310794_founda_0_configurations');
    if (config.get(configId)) {
        gs.info('Config: ' + config.name);
        gs.info('Target table: ' + config.table.getDisplayValue());
        
        var viIds = config.verification_items.toString().split(',');
        gs.info('Verification Items created: ' + viIds.length);
        
        for (var i = 0; i < viIds.length; i++) {
            var vi = new GlideRecord('x_1310794_founda_0_verification_items');
            if (vi.get(viIds[i])) {
                gs.info('  - ' + vi.name + ' (query: ' + vi.query_value + ')');
            }
        }
    }
    
    // Result:
    // ✅ 5 VI created:
    //    - Business Rules Check - sys_user
    //    - Client Scripts Check - sys_user
    //    - UI Actions Check - sys_user
    //    - Security ACLs Check - sys_user
    //    - Notifications Check - sys_user
    
})();


// ============================================
// EXAMPLE 2: Manual VI Selection
// ============================================
(function example2_manualSelection() {
    
    gs.info('');
    gs.info('=== EXAMPLE 2: Manual VI Selection ===');
    
    // Get BR Check VI template
    var viTemplate = new GlideRecord('x_1310794_founda_0_verification_items');
    viTemplate.addQuery('name', 'Business Rules Check');
    viTemplate.addQuery('is_template', true);
    viTemplate.query();
    if (!viTemplate.next()) {
        gs.error('VI Template not found');
        return;
    }
    
    // Clone VI manually
    var mgr = new x_1310794_founda_0.FHTemplateManager();
    var clonedVIId = mgr._cloneVI(viTemplate.sys_id.toString(), 'incident');
    
    // Create config manually
    var config = new GlideRecord('x_1310794_founda_0_configurations');
    config.initialize();
    config.name = 'Incident - BR Only';
    
    var targetTable = new GlideRecord('sys_db_object');
    targetTable.get('name', 'incident');
    config.table = targetTable.sys_id.toString();
    
    config.verification_items = clonedVIId;
    config.use_template = false;  // Manual selection
    config.active = true;
    
    var configId = config.insert();
    
    gs.info('✅ Configuration created: ' + configId);
    gs.info('Config: ' + config.name);
    gs.info('VI: Business Rules Check - incident');
    
    // Result:
    // ✅ 1 VI only (Business Rules Check)
    // ✅ Targeted on incident table
    
})();


// ============================================
// EXAMPLE 3: Security Audit Template
// ============================================
(function example3_securityAudit() {
    
    gs.info('');
    gs.info('=== EXAMPLE 3: Security Audit ===');
    
    var mgr = new x_1310794_founda_0.FHTemplateManager();
    
    var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
    if (!template.get('name', 'Security Audit')) {
        gs.error('Template not found');
        return;
    }
    
    var configId = mgr.createFromTemplate(
        template.sys_id.toString(),
        'Users - Security Audit',
        'sys_user',
        {
            ignore_servicenow_records: true
        }
    );
    
    gs.info('✅ Configuration created: ' + configId);
    
    // Check VIs
    var config = new GlideRecord('x_1310794_founda_0_configurations');
    if (config.get(configId)) {
        var viIds = config.verification_items.toString().split(',');
        gs.info('Verification Items: ' + viIds.length);
        
        for (var i = 0; i < viIds.length; i++) {
            var vi = new GlideRecord('x_1310794_founda_0_verification_items');
            if (vi.get(viIds[i])) {
                gs.info('  - ' + vi.name);
            }
        }
    }
    
    // Result:
    // ✅ 2 VI created:
    //    - Business Rules Security - sys_user
    //    - Security ACLs Check - sys_user
    
})();


// ============================================
// EXAMPLE 4: Run Analysis
// ============================================
(function example4_runAnalysis() {
    
    gs.info('');
    gs.info('=== EXAMPLE 4: Run Analysis ===');
    
    // Create config
    var mgr = new x_1310794_founda_0.FHTemplateManager();
    
    var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
    if (!template.get('name', 'Business Rules Only')) {
        gs.error('Template not found');
        return;
    }
    
    var configId = mgr.createFromTemplate(
        template.sys_id.toString(),
        'Users - BR Analysis',
        'sys_user',
        {
            ignore_servicenow_records: true
        }
    );
    
    gs.info('✅ Configuration created: ' + configId);
    
    // Run analysis
    gs.info('🚀 Running analysis...');
    var analyzer = new x_1310794_founda_0.FHAnalyzer();
    var result = analyzer.runAnalysis(configId);
    
    gs.info('');
    gs.info('=== ANALYSIS RESULTS ===');
    gs.info('Health Score: ' + result.health_score + '%');
    gs.info('Status: ' + result.status);
    gs.info('Total Issues: ' + result.details.issues.length);
    
    if (result.details.issues.length > 0) {
        gs.info('');
        gs.info('Issues by type:');
        var issuesByType = {};
        result.details.issues.forEach(function(issue) {
            issuesByType[issue.rule_type] = (issuesByType[issue.rule_type] || 0) + 1;
        });
        
        for (var type in issuesByType) {
            gs.info('  - ' + type + ': ' + issuesByType[type]);
        }
    }
    
})();


// ============================================
// EXAMPLE 5: List Available VI Templates
// ============================================
(function example5_listVITemplates() {
    
    gs.info('');
    gs.info('=== EXAMPLE 5: Available VI Templates ===');
    
    var vi = new GlideRecord('x_1310794_founda_0_verification_items');
    vi.addQuery('is_template', true);
    vi.addQuery('active', true);
    vi.orderBy('category');
    vi.orderBy('name');
    vi.query();
    
    var count = 0;
    var currentCategory = '';
    
    while (vi.next()) {
        if (vi.category != currentCategory) {
            currentCategory = vi.category.toString();
            gs.info('');
            gs.info('[' + currentCategory.toUpperCase() + ']');
        }
        
        var rulesCount = vi.issue_rules.toString().split(',').length;
        gs.info('  - ' + vi.name + ' (' + rulesCount + ' rules)');
        count++;
    }
    
    gs.info('');
    gs.info('Total VI Templates: ' + count);
    
})();


// ============================================
// EXAMPLE 6: Get Template Details
// ============================================
(function example6_templateDetails() {
    
    gs.info('');
    gs.info('=== EXAMPLE 6: Template Details ===');
    
    var mgr = new x_1310794_founda_0.FHTemplateManager();
    
    var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
    if (!template.get('name', 'Complete Table Health Check')) {
        gs.error('Template not found');
        return;
    }
    
    var details = mgr.getTemplateDetails(template.sys_id.toString());
    
    gs.info('Template: ' + details.name);
    gs.info('Description: ' + details.description);
    gs.info('Category: ' + details.category);
    gs.info('Estimated Duration: ' + details.estimated_duration + ' min');
    gs.info('');
    gs.info('Verification Items (' + details.verification_items.length + '):');
    
    for (var i = 0; i < details.verification_items.length; i++) {
        var vi = details.verification_items[i];
        gs.info('  ' + (i+1) + '. ' + vi.name);
        gs.info('     - Category: ' + vi.category);
        gs.info('     - Table: ' + vi.table);
        gs.info('     - Rules: ' + vi.rules_count);
        gs.info('     - Query: ' + vi.query_value);
    }
    
})();
