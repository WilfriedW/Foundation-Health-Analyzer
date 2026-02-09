// FHTemplateManager v2 - Complete template to configuration creation
// Script Include - API Name: x_1310794_founda_0.FHTemplateManager

var FHTemplateManager = Class.create();
FHTemplateManager.prototype = {
    initialize: function() {},

    // Get all active templates
    getTemplates: function(filters) {
        var templates = [];
        var gr = new GlideRecord('x_1310794_founda_0_analysis_templates');
        gr.addQuery('active', true);
        
        if (filters) {
            if (filters.table) gr.addQuery('table', filters.table);
            if (filters.category) gr.addQuery('category', filters.category);
        }
        
        gr.orderBy('category');
        gr.orderBy('name');
        gr.query();
        
        while (gr.next()) {
            templates.push({
                sys_id: gr.getValue('sys_id'),
                name: gr.getValue('name'),
                description: gr.getValue('description'),
                table: gr.getValue('table'),
                table_name: gr.table.getDisplayValue(),
                category: gr.getValue('category'),
                icon: gr.getValue('icon'),
                estimated_duration: gr.getValue('estimated_duration'),
                base_query: gr.getValue('base_query')
            });
        }
        
        return templates;
    },

    // Get template details with rules
    getTemplateDetails: function(templateId) {
        var template = this._getTemplate(templateId);
        if (!template) return null;
        
        template.rules = this._getTemplateRules(templateId);
        return template;
    },

    // Create configuration from template (complete implementation)
    createFromTemplate: function(templateId, configName, options) {
        var template = this._getTemplate(templateId);
        if (!template) throw 'Template not found: ' + templateId;
        
        // Create configuration
        var config = new GlideRecord('x_1310794_founda_0_configurations');
        config.initialize();
        config.name = configName || template.name;
        config.table = template.table;
        config.template = templateId;
        config.use_template = true;
        config.active = true;
        
        // Apply options
        if (options) {
            if (options.deep_scan !== undefined) config.deep_scan = options.deep_scan;
            if (options.ignore_servicenow_records !== undefined) 
                config.ignore_servicenow_records = options.ignore_servicenow_records;
            if (options.include_children_tables !== undefined) 
                config.include_children_tables = options.include_children_tables;
            if (options.include_ldap !== undefined) config.include_ldap = options.include_ldap;
        }
        
        var configId = config.insert();
        if (!configId) throw 'Failed to create configuration';
        
        // Create verification item and link rules
        this._createVerificationItemFromTemplate(templateId, configId, template);
        
        return configId;
    },

    // Create verification item from template rules
    _createVerificationItemFromTemplate: function(templateId, configId, template) {
        var rules = this._getTemplateRules(templateId);
        if (rules.length === 0) return;
        
        // Create one verification item with all rules
        var vi = new GlideRecord('x_1310794_founda_0_verification_items');
        vi.initialize();
        vi.name = template.name + ' - Rules';
        vi.category = template.category;
        vi.table = template.table;
        vi.query_type = 'encoded';
        vi.query_value = template.base_query || 'active=true';
        vi.fields = 'name,active,script,sys_created_by,sys_updated_by,sys_updated_on';
        vi.active = true;
        
        // Set issue_rules field (glide_list - comma-separated sys_ids)
        var ruleIds = [];
        rules.forEach(function(rule) {
            ruleIds.push(rule.rule_id);
        });
        vi.issue_rules = ruleIds.join(',');
        
        var viId = vi.insert();
        if (!viId) return;
        
        // Link verification item to configuration (glide_list field)
        var config = new GlideRecord('x_1310794_founda_0_configurations');
        if (config.get(configId)) {
            config.verification_items = viId;
            config.update();
        }
    },

    // Get template rules (only active rules)
    _getTemplateRules: function(templateId) {
        var rules = [];
        var gr = new GlideRecord('x_1310794_founda_0_template_rules');
        gr.addQuery('template', templateId);
        gr.addQuery('enabled', true);
        gr.orderBy('order');
        gr.query();
        
        while (gr.next()) {
            // Verify rule is active
            var ruleGr = new GlideRecord('x_1310794_founda_0_issue_rules');
            if (ruleGr.get(gr.getValue('rule')) && ruleGr.active) {
                rules.push({
                    rule_id: gr.getValue('rule'),
                    rule_code: ruleGr.getValue('code'),
                    rule_name: ruleGr.getValue('name'),
                    params_override: gr.getValue('params_override')
                });
            }
        }
        
        return rules;
    },

    // Get single template
    _getTemplate: function(templateId) {
        var gr = new GlideRecord('x_1310794_founda_0_analysis_templates');
        if (!gr.get(templateId)) return null;
        
        return {
            sys_id: gr.getValue('sys_id'),
            name: gr.getValue('name'),
            description: gr.getValue('description'),
            table: gr.getValue('table'),
            table_name: gr.table.getDisplayValue(),
            category: gr.getValue('category'),
            icon: gr.getValue('icon'),
            estimated_duration: gr.getValue('estimated_duration'),
            base_query: gr.getValue('base_query')
        };
    },

    type: 'FHTemplateManager'
};
