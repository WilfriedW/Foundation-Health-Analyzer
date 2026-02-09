// Populate Templates v3 - Multi Verification Items with glide_list
// Background Script - Run in ServiceNow Scripts - Background

(function() {
    
    gs.info('=== Starting Template Population v3 ===');
    
    // Clean existing data
    gs.info('Cleaning existing templates and VIs...');
    var cleanTemplate = new GlideRecord('x_1310794_founda_0_analysis_templates');
    cleanTemplate.query();
    while (cleanTemplate.next()) {
        cleanTemplate.deleteRecord();
    }
    
    var cleanVI = new GlideRecord('x_1310794_founda_0_verification_items');
    cleanVI.addQuery('is_template', true);
    cleanVI.query();
    while (cleanVI.next()) {
        cleanVI.deleteRecord();
    }
    
    gs.info('✅ Cleaned existing data');
    
    // === STEP 1: Create Verification Item Templates ===
    gs.info('');
    gs.info('Step 1: Creating Verification Item Templates...');
    
    var viTemplates = [
        // Business Rules
        {
            name: 'Business Rules Check',
            category: 'automation',
            table: 'sys_script',
            query_value: 'collection={0}^active=true^sys_packageISNOTEMPTY',
            fields: 'name,collection,active,script,when,sys_created_by,sys_updated_by',
            rules: ['BR_HEAVY', 'HARDCODED_SYSID', 'BR_DENSITY', 'MISSING_FIELD', 'SYSTEM_CREATED']
        },
        {
            name: 'Business Rules Performance',
            category: 'performance',
            table: 'sys_script',
            query_value: 'collection={0}^active=true^sys_packageISNOTEMPTY',
            fields: 'name,collection,script,when',
            rules: ['BR_HEAVY', 'BR_DENSITY']
        },
        {
            name: 'Business Rules Security',
            category: 'security',
            table: 'sys_script',
            query_value: 'collection={0}^active=true^sys_packageISNOTEMPTY',
            fields: 'name,collection,script',
            rules: ['HARDCODED_SYSID', 'PATTERN_SCAN']
        },
        
        // Client Scripts
        {
            name: 'Client Scripts Check',
            category: 'performance',
            table: 'sys_script_client',
            query_value: 'table={0}^active=true^sys_packageISNOTEMPTY',
            fields: 'name,table,active,script,type,sys_created_by',
            rules: ['CS_HEAVY', 'HARDCODED_SYSID', 'MISSING_FIELD']
        },
        
        // UI Actions
        {
            name: 'UI Actions Check',
            category: 'quality',
            table: 'sys_ui_action',
            query_value: 'table={0}^active=true^sys_packageISNOTEMPTY',
            fields: 'name,table,active,script,condition',
            rules: ['HARDCODED_SYSID', 'MISSING_FIELD', 'INACTIVE_RECORD']
        },
        
        // ACLs
        {
            name: 'Security ACLs Check',
            category: 'security',
            table: 'sys_security_acl',
            query_value: 'name={0}^ORname=*.{0}^ORname={0}.*^active=true',
            fields: 'name,type,operation,active,script',
            rules: ['ACL_PERMISSIVE', 'HARDCODED_SYSID', 'MISSING_FIELD']
        },
        
        // Notifications
        {
            name: 'Notifications Check',
            category: 'integration',
            table: 'sysevent_email_action',
            query_value: 'collection={0}^active=true',
            fields: 'name,collection,active,subject,message',
            rules: ['MISSING_FIELD', 'INACTIVE_RECORD', 'SYSTEM_CREATED']
        },
        
        // Direct table records
        {
            name: 'Table Records Check',
            category: 'quality',
            table: '{0}',
            query_value: 'active=true',
            fields: 'sys_id,active,sys_created_by,sys_updated_by',
            rules: ['MISSING_FIELD', 'DUPLICATE', 'INACTIVE_RECORD']
        }
    ];
    
    var viMap = {};  // name -> sys_id mapping
    
    for (var i = 0; i < viTemplates.length; i++) {
        var viDef = viTemplates[i];
        
        // Create VI template
        var vi = new GlideRecord('x_1310794_founda_0_verification_items');
        vi.initialize();
        vi.name = viDef.name;
        vi.category = viDef.category;
        vi.table = viDef.table;
        vi.query_type = 'encoded';
        vi.query_value = viDef.query_value;
        vi.fields = viDef.fields;
        vi.is_template = true;  // Mark as template
        vi.active = true;
        
        // Link rules (glide_list)
        var ruleIds = [];
        for (var j = 0; j < viDef.rules.length; j++) {
            var ruleName = viDef.rules[j];
            var rule = new GlideRecord('x_1310794_founda_0_issue_rules');
            if (rule.get('rule_type', ruleName)) {
                if (rule.active == true) {
                    ruleIds.push(rule.sys_id.toString());
                }
            }
        }
        vi.issue_rules = ruleIds.join(',');
        
        var viId = vi.insert();
        viMap[viDef.name] = viId;
        
        gs.info('  ✅ Created VI Template: ' + viDef.name + ' (' + ruleIds.length + ' rules)');
    }
    
    gs.info('✅ Created ' + Object.keys(viMap).length + ' VI Templates');
    
    // === STEP 2: Create Analysis Templates ===
    gs.info('');
    gs.info('Step 2: Creating Analysis Templates...');
    
    var templates = [
        {
            name: 'Complete Table Health Check',
            description: 'Complete analysis: BR, CS, UI Actions, ACLs, Notifications',
            table: '{0}',
            category: 'complete',
            icon: 'health',
            estimated_duration: 120,
            verification_items: [
                'Business Rules Check',
                'Client Scripts Check',
                'UI Actions Check',
                'Security ACLs Check',
                'Notifications Check'
            ]
        },
        {
            name: 'Security Audit',
            description: 'Security focused: BR security, ACLs',
            table: '{0}',
            category: 'security',
            icon: 'lock',
            estimated_duration: 60,
            verification_items: [
                'Business Rules Security',
                'Security ACLs Check'
            ]
        },
        {
            name: 'Performance Analysis',
            description: 'Performance focused: BR performance, heavy CS',
            table: '{0}',
            category: 'performance',
            icon: 'speed',
            estimated_duration: 45,
            verification_items: [
                'Business Rules Performance',
                'Client Scripts Check'
            ]
        },
        {
            name: 'Business Rules Only',
            description: 'Complete BR analysis only',
            table: '{0}',
            category: 'automation',
            icon: 'script',
            estimated_duration: 30,
            verification_items: [
                'Business Rules Check'
            ]
        },
        {
            name: 'Client Scripts Only',
            description: 'Complete CS analysis only',
            table: '{0}',
            category: 'performance',
            icon: 'user',
            estimated_duration: 25,
            verification_items: [
                'Client Scripts Check'
            ]
        },
        {
            name: 'Quality Check',
            description: 'Quality focused: UI Actions, Table Records',
            table: '{0}',
            category: 'quality',
            icon: 'check',
            estimated_duration: 30,
            verification_items: [
                'UI Actions Check',
                'Table Records Check'
            ]
        }
    ];
    
    for (var k = 0; k < templates.length; k++) {
        var templateDef = templates[k];
        
        // Create template
        var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
        template.initialize();
        template.name = templateDef.name;
        template.description = templateDef.description;
        template.table = templateDef.table;
        template.category = templateDef.category;
        template.icon = templateDef.icon;
        template.estimated_duration = templateDef.estimated_duration;
        template.active = true;
        
        // Link verification items (glide_list)
        var viIds = [];
        for (var l = 0; l < templateDef.verification_items.length; l++) {
            var viName = templateDef.verification_items[l];
            if (viMap[viName]) {
                viIds.push(viMap[viName]);
            }
        }
        template.verification_items = viIds.join(',');
        
        template.insert();
        
        gs.info('  ✅ Created Template: ' + templateDef.name + ' (' + viIds.length + ' VIs)');
    }
    
    gs.info('✅ Created ' + templates.length + ' Analysis Templates');
    
    gs.info('');
    gs.info('=== Template Population Complete ===');
    gs.info('Total VI Templates: ' + Object.keys(viMap).length);
    gs.info('Total Analysis Templates: ' + templates.length);
    gs.info('');
    gs.info('✅ Ready to use!');
    
})();
