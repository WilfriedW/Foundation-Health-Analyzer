// FHTemplateManager - Template management for Foundation Health Analyzer
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

    // Create configuration from template
    createFromTemplate: function(templateId, configName, options) {
        var template = this._getTemplate(templateId);
        if (!template) throw 'Template not found: ' + templateId;
        
        var config = new GlideRecord('x_1310794_founda_0_configurations');
        config.initialize();
        config.name = configName || template.name;
        config.table = template.table;
        config.template = templateId;
        config.use_template = true;
        config.base_query = template.base_query;
        config.active = true;
        
        // Apply options if provided
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
        
        // Link rules from template
        this._linkTemplateRules(templateId, configId);
        
        return configId;
    },

    // Get template rules
    _getTemplateRules: function(templateId) {
        var rules = [];
        var gr = new GlideRecord('x_1310794_founda_0_template_rules');
        gr.addQuery('template', templateId);
        gr.addQuery('enabled', true);
        gr.orderBy('order');
        gr.query();
        
        while (gr.next()) {
            rules.push({
                rule_id: gr.getValue('rule'),
                rule_code: gr.rule.code.toString(),
                rule_name: gr.rule.name.toString(),
                params_override: gr.getValue('params_override')
            });
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

    // Link template rules to configuration
    _linkTemplateRules: function(templateId, configId) {
        var templateRules = new GlideRecord('x_1310794_founda_0_template_rules');
        templateRules.addQuery('template', templateId);
        templateRules.addQuery('enabled', true);
        templateRules.query();
        
        // Note: This assumes you'll create verification items from these rules
        // Implementation depends on your exact data model for config -> rules link
        // You may need to adjust this based on your verification items structure
        
        return true;
    },

    type: 'FHTemplateManager'
};
