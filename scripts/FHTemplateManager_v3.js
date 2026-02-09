// FHTemplateManager v3 - Multi Verification Items support with glide_list
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
        
        gr.query();
        while (gr.next()) {
            templates.push({
                sys_id: gr.sys_id.toString(),
                name: gr.getValue('name'),
                description: gr.getValue('description'),
                table: gr.getValue('table'),
                category: gr.getValue('category'),
                icon: gr.getValue('icon'),
                estimated_duration: gr.getValue('estimated_duration'),
                verification_items_count: this._countTemplateVIs(gr.sys_id.toString())
            });
        }
        
        return templates;
    },

    // Get template details with verification items
    getTemplateDetails: function(templateId) {
        var template = this._getTemplate(templateId);
        if (!template) return null;
        
        template.verification_items = this._getTemplateVIs(templateId);
        return template;
    },

    // Create configuration from template (complete implementation)
    // @param templateId - sys_id of template
    // @param configName - Name for the configuration
    // @param targetTable - (Optional) sys_id or name of target table (overrides template.table)
    // @param options - (Optional) Configuration options
    createFromTemplate: function(templateId, configName, targetTable, options) {
        // Handle old signature (no targetTable parameter)
        if (typeof targetTable === 'object' && targetTable !== null) {
            options = targetTable;
            targetTable = null;
        }
        
        var template = this._getTemplate(templateId);
        if (!template) throw 'Template not found: ' + templateId;
        
        // Determine target table (from parameter or template)
        var tableValue = template.table;
        if (targetTable) {
            // Check if it's a sys_id or table name
            var dbObject = new GlideRecord('sys_db_object');
            if (dbObject.get(targetTable)) {
                tableValue = dbObject.sys_id.toString();
            } else if (dbObject.get('name', targetTable)) {
                tableValue = dbObject.sys_id.toString();
            }
        }
        
        // Create configuration
        var config = new GlideRecord('x_1310794_founda_0_configurations');
        config.initialize();
        config.name = configName || template.name;
        config.table = tableValue;
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
        
        // Clone verification items from template
        this._cloneVerificationItemsFromTemplate(templateId, configId, tableValue);
        
        return configId;
    },

    // Clone verification items from template to configuration
    _cloneVerificationItemsFromTemplate: function(templateId, configId, targetTableId) {
        var templateVIs = this._getTemplateVIs(templateId);
        if (templateVIs.length === 0) return;
        
        // Get target table name for {0} replacement
        var targetTableName = '';
        var dbObject = new GlideRecord('sys_db_object');
        if (dbObject.get(targetTableId)) {
            targetTableName = dbObject.name.toString();
        }
        
        var clonedVIIds = [];
        
        // Clone each verification item
        for (var i = 0; i < templateVIs.length; i++) {
            var templateVI = templateVIs[i];
            var clonedVIId = this._cloneVI(templateVI.sys_id, targetTableName);
            if (clonedVIId) {
                clonedVIIds.push(clonedVIId);
            }
        }
        
        // Link cloned VIs to configuration
        if (clonedVIIds.length > 0) {
            var config = new GlideRecord('x_1310794_founda_0_configurations');
            if (config.get(configId)) {
                config.verification_items = clonedVIIds.join(',');
                config.update();
            }
        }
    },

    // Clone a single verification item
    _cloneVI: function(templateVIId, targetTableName) {
        var templateVI = new GlideRecord('x_1310794_founda_0_verification_items');
        if (!templateVI.get(templateVIId)) return null;
        
        // Create new VI instance
        var vi = new GlideRecord('x_1310794_founda_0_verification_items');
        vi.initialize();
        
        // Copy all fields
        vi.name = templateVI.name + (targetTableName ? ' - ' + targetTableName : '');
        vi.category = templateVI.category.toString();
        vi.table = templateVI.table.toString();
        vi.query_type = templateVI.query_type.toString();
        vi.fields = templateVI.fields.toString();
        vi.active = true;
        vi.is_template = false;  // This is an instance, not a template
        
        // Replace {0} in query_value
        var queryValue = templateVI.query_value.toString();
        if (targetTableName) {
            queryValue = queryValue.replace(/{0}/g, targetTableName);
        }
        vi.query_value = queryValue;
        
        // Handle table field if it contains {0}
        var viTable = templateVI.table.toString();
        if (viTable === '{0}' && targetTableName) {
            var dbObject = new GlideRecord('sys_db_object');
            if (dbObject.get('name', targetTableName)) {
                vi.table = dbObject.sys_id.toString();
            }
        }
        
        // Copy issue_rules (glide_list)
        vi.issue_rules = templateVI.issue_rules.toString();
        
        var viId = vi.insert();
        return viId;
    },

    // Get template verification items
    _getTemplateVIs: function(templateId) {
        var vis = [];
        var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
        if (!template.get(templateId)) return vis;
        
        // Get VIs from template.verification_items (glide_list)
        var viIds = template.verification_items.toString();
        if (!viIds) return vis;
        
        var viIdArray = viIds.split(',');
        for (var i = 0; i < viIdArray.length; i++) {
            var viId = viIdArray[i].trim();
            if (!viId) continue;
            
            var vi = new GlideRecord('x_1310794_founda_0_verification_items');
            if (vi.get(viId)) {
                vis.push({
                    sys_id: vi.sys_id.toString(),
                    name: vi.getValue('name'),
                    category: vi.getValue('category'),
                    table: vi.getValue('table'),
                    query_type: vi.getValue('query_type'),
                    query_value: vi.getValue('query_value'),
                    fields: vi.getValue('fields'),
                    is_template: vi.getValue('is_template'),
                    rules_count: vi.issue_rules.toString().split(',').length
                });
            }
        }
        
        return vis;
    },

    // Count template VIs
    _countTemplateVIs: function(templateId) {
        return this._getTemplateVIs(templateId).length;
    },

    // Get template record
    _getTemplate: function(templateId) {
        var gr = new GlideRecord('x_1310794_founda_0_analysis_templates');
        if (!gr.get(templateId)) return null;
        
        return {
            sys_id: gr.sys_id.toString(),
            name: gr.getValue('name'),
            description: gr.getValue('description'),
            table: gr.getValue('table'),
            category: gr.getValue('category'),
            icon: gr.getValue('icon'),
            estimated_duration: gr.getValue('estimated_duration')
        };
    },

    type: 'FHTemplateManager'
};
