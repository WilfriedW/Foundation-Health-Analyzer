# Templates System - Quick Start Guide

## 📋 Overview

The templates system simplifies configuration creation by providing pre-configured analysis templates.

## 🚀 Quick Start (3 Steps)

### Step 1: Create Script Include in ServiceNow

1. Navigate to: **System Definition > Script Includes**
2. Click **New**
3. Fill in:
   - **Name**: `FHTemplateManager`
   - **API Name**: `x_1310794_founda_0.FHTemplateManager`
   - **Active**: ✅ Checked
   - **Script**: Copy content from `scripts/FHTemplateManager.js`
4. Click **Submit**

### Step 2: Populate Default Templates

1. Navigate to: **System Definition > Scripts - Background**
2. Copy content from `scripts/populate_default_templates.js`
3. Click **Run script**
4. Check output: Should show "Templates created: 10"

### Step 3: Create Your First Config from Template

1. Navigate to: **System Definition > Scripts - Background**
2. Copy content from `scripts/create_config_from_template.js`
3. Modify these lines if needed:
   ```javascript
   var templateName = 'Standard Business Rules Analysis';
   var configName = 'My BR Analysis';
   ```
4. Click **Run script**
5. Check output for the configuration URL

## ✅ Verify Installation

### Check Templates Created

```javascript
var gr = new GlideRecord('x_1310794_founda_0_analysis_templates');
gr.addQuery('active', true);
gr.query();
gs.info('Total templates: ' + gr.getRowCount());
```

**Expected**: 10 templates

### List All Templates

```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();
var templates = mgr.getTemplates();
templates.forEach(function(t) {
    gs.info(t.name + ' (' + t.category + ') - ' + t.estimated_duration + 's');
});
```

## 📚 Available Templates

| Template Name | Table | Category | Duration | Rules |
|---------------|-------|----------|----------|-------|
| Standard Business Rules Analysis | sys_script | automation | 30s | 5 rules |
| Quick Business Rules Check | sys_script | automation | 15s | 2 rules |
| Security ACLs Audit | sys_security_acl | security | 45s | 4 rules |
| Client Scripts Performance | sys_script_client | performance | 25s | 3 rules |
| UI Actions Quality Check | sys_ui_action | quality | 20s | 3 rules |
| Scheduled Jobs Analysis | sysauto_script | automation | 20s | 3 rules |
| Script Includes Review | sys_script_include | quality | 35s | 3 rules |
| Email Notifications Audit | sysevent_email_action | integration | 25s | 3 rules |
| REST Messages Security | sys_rest_message | security | 30s | 2 rules |
| Service Portal Widgets | sp_widget | quality | 40s | 2 rules |

## 🎯 Usage Examples

### Example 1: Create from Template (Simple)

```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();
var configId = mgr.createFromTemplate(
    'TEMPLATE_SYS_ID',
    'My Config Name'
);
gs.info('Created: ' + configId);
```

### Example 2: Create with Custom Options

```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();
var configId = mgr.createFromTemplate(
    'TEMPLATE_SYS_ID',
    'My Config Name',
    {
        deep_scan: true,
        ignore_servicenow_records: true,
        include_children_tables: false
    }
);
```

### Example 3: Get Template Details

```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();
var details = mgr.getTemplateDetails('TEMPLATE_SYS_ID');
gs.info('Template: ' + details.name);
gs.info('Rules: ' + details.rules.length);
```

### Example 4: List Templates by Category

```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();
var templates = mgr.getTemplates({ category: 'security' });
templates.forEach(function(t) {
    gs.info(t.name);
});
```

## 🔧 API Reference

### FHTemplateManager Methods

#### getTemplates(filters)
Returns all active templates, optionally filtered.

**Parameters**:
- `filters` (Object, optional):
  - `table` (String): Filter by table name
  - `category` (String): Filter by category

**Returns**: Array of template objects

#### getTemplateDetails(templateId)
Returns template details including linked rules.

**Parameters**:
- `templateId` (String): Template sys_id

**Returns**: Template object with rules array

#### createFromTemplate(templateId, configName, options)
Creates a configuration from a template.

**Parameters**:
- `templateId` (String): Template sys_id
- `configName` (String): Name for new configuration
- `options` (Object, optional): Configuration options

**Returns**: Configuration sys_id

## 🎨 Next Steps

After installation, you can:

1. **Create custom templates** in `x_1310794_founda_0_analysis_templates`
2. **Modify default templates** to match your needs
3. **Create UI Action** for "Create from Template" button (coming soon)
4. **Create Widget** for template selection (coming soon)

## 📞 Troubleshooting

### "Template not found"
- Check template is active
- Verify template name spelling
- List all templates to confirm

### "Failed to create configuration"
- Check user has required roles
- Verify table reference is valid
- Check ACLs on configurations table

### "Rules not linked"
- Verify rules exist with correct codes
- Check M2M table `x_1310794_founda_0_template_rules`
- Ensure rules are active

## 📝 File Structure

```
scripts/
├── FHTemplateManager.js              # Script Include (copy to ServiceNow)
├── populate_default_templates.js     # Background Script (run once)
├── create_config_from_template.js    # Background Script (utility)
└── TEMPLATES_README.md               # This file
```

---

**Version**: 1.0  
**Date**: 2026-02-09  
**Status**: ✅ Ready to use
