// Populate Default Templates
// Run once in Background Script to create default analysis templates

(function() {
    
    var templates = [
        {
            name: 'Business Rules Check',
            description: 'Analyze Business Rules on target table: performance, security, quality',
            table: 'sys_script',
            category: 'automation',
            base_query: 'collection={0}^active=true^sys_packageISNOTEMPTY',
            icon: 'script',
            estimated_duration: 30,
            rules: ['BR_HEAVY', 'HARDCODED_SYSID', 'BR_DENSITY', 'MISSING_FIELD', 'SYSTEM_CREATED']
        },
        {
            name: 'Business Rules Quick Check',
            description: 'Fast check for critical BR issues on target table',
            table: 'sys_script',
            category: 'automation',
            base_query: 'collection={0}^active=true^sys_packageISNOTEMPTY',
            icon: 'flash',
            estimated_duration: 15,
            rules: ['BR_HEAVY', 'HARDCODED_SYSID']
        },
        {
            name: 'Security ACLs Check',
            description: 'Security audit of ACLs on target table',
            table: 'sys_security_acl',
            category: 'security',
            base_query: 'name={0}^ORname=*.{0}^ORname={0}.*^active=true',
            icon: 'lock',
            estimated_duration: 45,
            rules: ['ACL_PERMISSIVE', 'HARDCODED_SYSID', 'MISSING_FIELD', 'SYSTEM_CREATED']
        },
        {
            name: 'Client Scripts Check',
            description: 'Analyze Client Scripts on target table for performance issues',
            table: 'sys_script_client',
            category: 'performance',
            base_query: 'table={0}^active=true^sys_packageISNOTEMPTY',
            icon: 'user',
            estimated_duration: 25,
            rules: ['CS_HEAVY', 'HARDCODED_SYSID', 'MISSING_FIELD']
        },
        {
            name: 'UI Actions Check',
            description: 'Check UI Actions on target table',
            table: 'sys_ui_action',
            category: 'quality',
            base_query: 'table={0}^active=true^sys_packageISNOTEMPTY',
            icon: 'button',
            estimated_duration: 20,
            rules: ['HARDCODED_SYSID', 'MISSING_FIELD', 'INACTIVE_RECORD']
        },
        {
            name: 'Table Records Direct Check',
            description: 'Direct analysis of records in target table',
            table: '{0}',
            category: 'quality',
            base_query: 'active=true',
            icon: 'table',
            estimated_duration: 20,
            rules: ['MISSING_FIELD', 'DUPLICATE', 'INACTIVE_RECORD', 'SYSTEM_CREATED']
        },
        {
            name: 'Scheduled Jobs Analysis',
            description: 'Analyze all Scheduled Jobs (instance-wide)',
            table: 'sysauto_script',
            category: 'automation',
            base_query: 'active=true',
            icon: 'clock',
            estimated_duration: 20,
            rules: ['HARDCODED_SYSID', 'MISSING_FIELD', 'SYSTEM_CREATED']
        },
        {
            name: 'Script Includes Review',
            description: 'Review all Script Includes (instance-wide)',
            table: 'sys_script_include',
            category: 'quality',
            base_query: 'active=true^sys_packageISNOTEMPTY',
            icon: 'code',
            estimated_duration: 35,
            rules: ['HARDCODED_SYSID', 'SIZE_THRESHOLD', 'MISSING_FIELD']
        },
        {
            name: 'Email Notifications Audit',
            description: 'Audit all Email Notifications (instance-wide)',
            table: 'sysevent_email_action',
            category: 'integration',
            base_query: 'active=true',
            icon: 'email',
            estimated_duration: 25,
            rules: ['MISSING_FIELD', 'INACTIVE_RECORD', 'SYSTEM_CREATED']
        },
        {
            name: 'REST Messages Security',
            description: 'Security review of all REST Messages (instance-wide)',
            table: 'sys_rest_message',
            category: 'security',
            base_query: 'active=true',
            icon: 'api',
            estimated_duration: 30,
            rules: ['HARDCODED_SYSID', 'MISSING_FIELD']
        },
        {
            name: 'Service Portal Widgets',
            description: 'Analyze all Service Portal Widgets (instance-wide)',
            table: 'sp_widget',
            category: 'quality',
            base_query: 'active=true^sys_packageISNOTEMPTY',
            icon: 'widget',
            estimated_duration: 40,
            rules: ['HARDCODED_SYSID', 'SIZE_THRESHOLD']
        }
    ];

    var created = 0;
    var errors = 0;

    templates.forEach(function(tpl) {
        try {
            // Get table sys_id
            var tableGr = new GlideRecord('sys_db_object');
            if (!tableGr.get('name', tpl.table)) {
                gs.error('Table not found: ' + tpl.table);
                errors++;
                return;
            }

            // Create template
            var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
            template.initialize();
            template.name = tpl.name;
            template.description = tpl.description;
            template.table = tableGr.sys_id;
            template.category = tpl.category;
            template.base_query = tpl.base_query;
            template.icon = tpl.icon;
            template.estimated_duration = tpl.estimated_duration;
            template.active = true;
            
            var templateId = template.insert();
            
            if (templateId) {
                // Link rules
                var order = 100;
                tpl.rules.forEach(function(ruleCode) {
                    var ruleGr = new GlideRecord('x_1310794_founda_0_issue_rules');
                    if (ruleGr.get('code', ruleCode)) {
                        var link = new GlideRecord('x_1310794_founda_0_template_rules');
                        link.initialize();
                        link.template = templateId;
                        link.rule = ruleGr.sys_id;
                        link.enabled = true;
                        link.order = order;
                        link.insert();
                        order += 100;
                    }
                });
                
                created++;
                gs.info('Created template: ' + tpl.name);
            }
        } catch (e) {
            gs.error('Error creating template ' + tpl.name + ': ' + e);
            errors++;
        }
    });

    gs.info('Templates created: ' + created + ', Errors: ' + errors);
    
})();
