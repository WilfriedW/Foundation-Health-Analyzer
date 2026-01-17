# FHA Documentation Widget - Update Instructions

> **Version:** 1.3.0  
> **Date:** 2026-01-17  
> **Widget ID:** `fha-documentation`  
> **Widget sys_id:** `5ada939c8392f21083e1b4a6feaad360`  
> **Page ID:** `fha_documentation`  
> **Page sys_id:** `277a975c8392f21083e1b4a6feaad318`

---

## 📋 Overview

This document provides instructions to update the **FHA Documentation Widget** to make it the single source of truth for all Foundation Health Analyzer documentation. The widget will reference the newly created consolidated documentation and provide comprehensive, user-friendly navigation.

---

## 🎯 Update Objectives

1. ✅ **Make it the single documentation source** - One place for all FHA documentation
2. ✅ **Reference consolidated documentation** - Link to CONSOLIDATED_DOCUMENTATION.md
3. ✅ **Provide comprehensive component inventory** - List all active and obsolete components
4. ✅ **Include troubleshooting guide** - Common issues and solutions
5. ✅ **Add migration information** - Upgrade paths and version history
6. ✅ **Maintain English language** - All content in English for consistency
7. ✅ **Keep responsive design** - Modern, accessible UI with scroll-spy navigation

---

## 📦 Changes Summary

### Current State (v1.1.1-doc)
- 10 sections (Description, Installation, Configuration, Options, Scores, Checks, Architecture, API, Best Practices, Resources)
- ~1084 lines of code
- Basic architecture diagram
- Limited component documentation
- No obsolete components tracking

### Target State (v1.3.0)
- **12 sections** (added: Components, Troubleshooting)
- Enhanced architecture information
- Complete component inventory (active + obsolete)
- Troubleshooting guide
- Link to consolidated documentation
- Obsolete components cleanup guide

---

## 🔧 Update Procedure

### Option 1: Update via ServiceNow UI (Recommended for Production)

#### Step 1: Navigate to Widget

1. Navigate to **Service Portal > Service Portal Configuration**
2. Click **Widgets**
3. Filter by: `Name = FHA Documentation`
4. Click on the widget to open

#### Step 2: Update Server Script

Add version and consolidated doc reference:

```javascript
(function() {
    data.appVersion = (typeof gs !== 'undefined' && gs.getProperty) ? gs.getProperty('x_1310794_founda_0.version', '1.3.0') : '1.3.0';
    data.lastUpdated = (typeof gs !== 'undefined' && gs.getProperty) ? gs.getProperty('x_1310794_founda_0.doc.last_updated', '2026-01-17') : '2026-01-17';
    data.pageId = '277a975c8392f21083e1b4a6feaad318';
    data.widgetId = '5ada939c8392f21083e1b4a6feaad360';
    
    // NEW: Add consolidated documentation metadata
    data.consolidatedDocUrl = '/CONSOLIDATED_DOCUMENTATION.md';
    data.hasConsolidatedDoc = true;
    data.componentCount = {
        active: 3,
        inactive: 9,
        widgets: 4,
        apis: 8
    };
})();
```

#### Step 3: Update Client Controller

Add new sections to scroll-spy:

```javascript
// Replace line 9:
var sectionIds = ['description','installation','configuration','options','scores','checks','architecture','api','components','troubleshooting','best-practices','resources'];
```

#### Step 4: Update Template HTML

Add two new navigation buttons after 'api':

```html
<button class="fha-doc-nav-btn" ng-class="{'active': c.activeSection === 'components'}" ng-click="c.scrollToSection('components')">
    <i class="fa fa-puzzle-piece"></i> ${Components}
</button>
<button class="fha-doc-nav-btn" ng-class="{'active': c.activeSection === 'troubleshooting'}" ng-click="c.scrollToSection('troubleshooting')">
    <i class="fa fa-wrench"></i> ${Troubleshooting}
</button>
```

Add new sections after API section (before Best Practices):

```html
<!-- Components Section -->
<div id="components" class="fha-doc-section">
    <h2><i class="fa fa-puzzle-piece"></i> ${Components Inventory}</h2>
    <p>${Complete list of all FHA components with status and recommendations.}</p>
    
    <div class="fha-info-box">
        <strong>${Quick Stats}:</strong>
        <ul class="fha-doc-list">
            <li><strong>{{c.data.componentCount.active}}</strong> ${active Script Includes}</li>
            <li><strong>{{c.data.componentCount.inactive}}</strong> ${inactive Script Includes (marked for removal)}</li>
            <li><strong>{{c.data.componentCount.widgets}}</strong> ${Service Portal widgets}</li>
            <li><strong>{{c.data.componentCount.apis}}</strong> ${REST API endpoints}</li>
        </ul>
    </div>

    <h3>${Active Components}</h3>
    <table class="fha-doc-table">
        <thead>
            <tr>
                <th>${Component}</th>
                <th>${Type}</th>
                <th>${Purpose}</th>
                <th>${Status}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><span class="fha-code-inline">FHAnalyzer</span></td>
                <td>Script Include</td>
                <td>${Main entry point for analysis}</td>
                <td><span class="fha-severity-badge fha-severity-low">Active</span></td>
            </tr>
            <tr>
                <td><span class="fha-code-inline">FHAnalysisEngine</span></td>
                <td>Script Include</td>
                <td>${Orchestrates verification execution}</td>
                <td><span class="fha-severity-badge fha-severity-low">Active</span></td>
            </tr>
            <tr>
                <td><span class="fha-code-inline">FHARuleEvaluator</span></td>
                <td>Script Include</td>
                <td>${Rule evaluation engine (29 handlers)}</td>
                <td><span class="fha-severity-badge fha-severity-low">Active</span></td>
            </tr>
            <tr>
                <td><span class="fha-code-inline">FHA Dashboard</span></td>
                <td>Widget</td>
                <td>${Main dashboard with analysis controls}</td>
                <td><span class="fha-severity-badge fha-severity-low">Active</span></td>
            </tr>
            <tr>
                <td><span class="fha-code-inline">FHA Analysis Detail</span></td>
                <td>Widget</td>
                <td>${Detailed results with tabs and filters}</td>
                <td><span class="fha-severity-badge fha-severity-low">Active</span></td>
            </tr>
        </tbody>
    </table>

    <h3>${Obsolete Components}</h3>
    <div class="fha-info-box warning">
        <strong>${Note}:</strong> ${The following components are inactive and can be safely removed. See OBSOLETE_COMPONENTS_CLEANUP.md for detailed instructions.}
    </div>
    <table class="fha-doc-table">
        <thead>
            <tr>
                <th>${Component}</th>
                <th>${Reason}</th>
                <th>${Replaced By}</th>
                <th>${Action}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><span class="fha-code-inline">FHCheckTable</span></td>
                <td>${Legacy architecture}</td>
                <td>FHARuleEvaluator</td>
                <td><span class="fha-severity-badge fha-severity-high">Remove</span></td>
            </tr>
            <tr>
                <td><span class="fha-code-inline">FHCheckAutomation</span></td>
                <td>${Legacy architecture}</td>
                <td>FHARuleEvaluator</td>
                <td><span class="fha-severity-badge fha-severity-high">Remove</span></td>
            </tr>
            <tr>
                <td><span class="fha-code-inline">FHCheckIntegration</span></td>
                <td>${Legacy architecture}</td>
                <td>FHARuleEvaluator</td>
                <td><span class="fha-severity-badge fha-severity-high">Remove</span></td>
            </tr>
            <tr>
                <td><span class="fha-code-inline">FHCheckRegistry</span></td>
                <td>${Not used}</td>
                <td>Configuration table</td>
                <td><span class="fha-severity-badge fha-severity-high">Remove</span></td>
            </tr>
            <tr>
                <td colspan="4" class="text-center">${... 5 more (see OBSOLETE_COMPONENTS_CLEANUP.md)}</td>
            </tr>
        </tbody>
    </table>

    <h3>${Documentation Files}</h3>
    <ul class="fha-doc-list">
        <li><strong>CONSOLIDATED_DOCUMENTATION.md</strong> - ${Complete documentation (all sections, 50+ pages)}</li>
        <li><strong>OBSOLETE_COMPONENTS_CLEANUP.md</strong> - ${Cleanup guide for obsolete components}</li>
        <li><strong>README.md</strong> - ${Quick start and overview}</li>
        <li><strong>CHANGELOG.md</strong> - ${Version history and changes}</li>
        <li><strong>docs/handlers/</strong> - ${Handler documentation (29 handlers)}</li>
        <li><strong>docs/architecture.md</strong> - ${Technical architecture}</li>
    </ul>
</div>

<!-- Troubleshooting Section -->
<div id="troubleshooting" class="fha-doc-section">
    <h2><i class="fa fa-wrench"></i> ${Troubleshooting}</h2>
    <p>${Common issues and solutions for Foundation Health Analyzer.}</p>

    <h3>${Common Issues}</h3>
    
    <div class="fha-option-card">
        <h4><i class="fa fa-times-circle"></i> ${Configuration not found}</h4>
        <p><strong>${Symptom}:</strong> ${Analysis fails with "Configuration not found"}</p>
        <p><strong>${Cause}:</strong> ${Configuration record is inactive or deleted}</p>
        <p><strong>${Solution}:</strong></p>
        <pre class="fha-code-block">var config = new GlideRecord('x_1310794_founda_0_configurations');
config.addQuery('sys_id', 'YOUR_CONFIG_SYS_ID');
config.addQuery('active', true);
config.query();
if (!config.next()) {
    gs.error('Configuration not found or inactive');
}</pre>
    </div>

    <div class="fha-option-card">
        <h4><i class="fa fa-exclamation-circle"></i> ${Empty results in widget}</h4>
        <p><strong>${Symptom}:</strong> ${Analysis completes but no data shows in widget}</p>
        <p><strong>${Cause}:</strong> <span class="fha-code-inline">details</span> ${field not populated}</p>
        <p><strong>${Solution}:</strong></p>
        <ul class="fha-doc-list">
            <li>${Run a new analysis (old analyses may not have JSON details)}</li>
            <li>${Check browser console for JavaScript errors}</li>
            <li>${Verify} <span class="fha-code-inline">details</span> ${field contains valid JSON}</li>
        </ul>
    </div>

    <div class="fha-option-card">
        <h4><i class="fa fa-clock"></i> ${Slow analysis performance}</h4>
        <p><strong>${Symptom}:</strong> ${Analysis takes >5 minutes}</p>
        <p><strong>${Cause}:</strong> ${Large table + deep_scan + children tables}</p>
        <p><strong>${Solution}:</strong></p>
        <ul class="fha-doc-list">
            <li>${Disable} <span class="fha-code-inline">deep_scan</span> ${for initial runs}</li>
            <li>${Set} <span class="fha-code-inline">include_children_tables=false</span></li>
            <li>${Add filters to verification items}</li>
            <li>${Run analysis during off-peak hours}</li>
        </ul>
    </div>

    <div class="fha-option-card">
        <h4><i class="fa fa-ban"></i> ${REST API 403 Forbidden}</h4>
        <p><strong>${Symptom}:</strong> ${API calls return 403 error}</p>
        <p><strong>${Cause}:</strong> ${Missing role or incorrect authentication}</p>
        <p><strong>${Solution}:</strong></p>
        <ul class="fha-doc-list">
            <li>${Verify user has} <span class="fha-code-inline">x_1310794_founda_0.admin</span> ${or} <span class="fha-code-inline">user</span> ${role}</li>
            <li>${Check HTTP Basic Auth credentials}</li>
            <li>${Review REST API ACLs}</li>
        </ul>
    </div>

    <h3>${Debug Mode}</h3>
    <p>${Enable debug logging for troubleshooting:}</p>
    <pre class="fha-code-block">gs.setProperty('x_1310794_founda_0.debug', 'true');</pre>
    <p>${View logs in System Logs (filter: source=x_1310794_founda_0)}</p>

    <h3>${Get Help}</h3>
    <ul class="fha-doc-list">
        <li><strong>${Consolidated Documentation}:</strong> ${See CONSOLIDATED_DOCUMENTATION.md for complete guide}</li>
        <li><strong>${Component Issues}:</strong> ${See OBSOLETE_COMPONENTS_CLEANUP.md}</li>
        <li><strong>${Contact}:</strong> ${Project Owner - Wilfried Waret}</li>
    </ul>
</div>
```

Update Resources section to include new documentation files:

```html
<!-- Update Resources Section -->
<div id="resources" class="fha-doc-section">
    <h2><i class="fa fa-bookmark"></i> ${Additional resources}</h2>
    
    <h3>${📚 Documentation Files}</h3>
    <table class="fha-doc-table">
        <thead>
            <tr>
                <th>${Document}</th>
                <th>${Description}</th>
                <th>${Pages}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>CONSOLIDATED_DOCUMENTATION.md</strong></td>
                <td>${Complete FHA documentation - Single source of truth}</td>
                <td>~50</td>
            </tr>
            <tr>
                <td><strong>OBSOLETE_COMPONENTS_CLEANUP.md</strong></td>
                <td>${Guide for removing 9 obsolete Script Includes}</td>
                <td>~15</td>
            </tr>
            <tr>
                <td><strong>README.md</strong></td>
                <td>${Quick start and overview}</td>
                <td>~20</td>
            </tr>
            <tr>
                <td><strong>docs/handlers/HANDLERS_REFERENCE.md</strong></td>
                <td>${Complete reference for 29 rule handlers}</td>
                <td>~25</td>
            </tr>
            <tr>
                <td><strong>docs/handlers/SCRIPTS_LIBRARY.md</strong></td>
                <td>${15+ ready-to-use scripts}</td>
                <td>~18</td>
            </tr>
        </tbody>
    </table>

    <h3>${🔧 Component Files}</h3>
    <ul class="fha-doc-list">
        <li><strong>${Widget source}:</strong> <span class="fha-code-inline">sp_widget_5ada939c8392f21083e1b4a6feaad360.xml</span></li>
        <li><strong>${Service Portal page}:</strong> <span class="fha-code-inline">sp_page_277a975c8392f21083e1b4a6feaad318.xml</span></li>
        <li><strong>${Script Includes}:</strong> <span class="fha-code-inline">FHAnalyzer</span>, <span class="fha-code-inline">FHAnalysisEngine</span>, <span class="fha-code-inline">FHARuleEvaluator</span></li>
        <li><strong>${REST API}:</strong> <span class="fha-code-inline">sys_ws_operation_*</span> ${in update folder (8 endpoints)}</li>
    </ul>

    <h3>${Changelog}</h3>
    <table class="fha-doc-table">
        <thead>
            <tr>
                <th>${Version}</th>
                <th>${Date}</th>
                <th>${Notes}</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>1.3.0</td><td>2026-01-17</td><td>${Complete documentation overhaul - Consolidated docs, component inventory, troubleshooting}</td></tr>
            <tr><td>1.2.0-doc</td><td>2026-01-16</td><td>${Enhanced widget documentation (13x improvement)}</td></tr>
            <tr><td>1.1.1-doc</td><td>2026-01-14</td><td>${Scroll-spy navigation, system properties}</td></tr>
            <tr><td>1.1.0</td><td>2026-01-04</td><td>${Rule-based architecture, 29 handlers, configuration options}</td></tr>
            <tr><td>1.0.0</td><td>2026-01-03</td><td>${Initial release}</td></tr>
        </tbody>
    </table>
</div>
```

#### Step 5: Save and Test

1. Click **Update** to save changes
2. Navigate to `/fha?id=fha_documentation`
3. Verify:
   - ✅ All sections visible
   - ✅ Scroll-spy navigation works
   - ✅ Components section shows inventory
   - ✅ Troubleshooting section displays
   - ✅ No JavaScript errors in console

---

### Option 2: Update via Update Set (Recommended for Deployment)

1. Export current widget as XML backup
2. Create new Update Set: "FHA Documentation Widget v1.3.0"
3. Make changes as described above
4. Capture widget in Update Set
5. Export Update Set
6. Deploy to target instances

---

## 📊 Before/After Comparison

### Before (v1.1.1-doc)
- ❌ No component inventory
- ❌ No troubleshooting guide
- ❌ No reference to consolidated documentation
- ❌ Missing obsolete components information
- ✅ 10 sections with scroll-spy
- ✅ Responsive design

### After (v1.3.0)
- ✅ Complete component inventory (active + obsolete)
- ✅ Comprehensive troubleshooting guide
- ✅ Links to CONSOLIDATED_DOCUMENTATION.md
- ✅ Obsolete components cleanup reference
- ✅ 12 sections with enhanced scroll-spy
- ✅ Improved navigation and metadata

---

## ✅ Testing Checklist

After update, verify:

- [ ] Widget loads without errors
- [ ] All 12 sections visible in navigation
- [ ] Scroll-spy correctly highlights active section
- [ ] "Back to dashboard" button works
- [ ] Components table displays active/obsolete components
- [ ] Troubleshooting section shows 4+ common issues
- [ ] Resources section updated with new documentation files
- [ ] Changelog shows version 1.3.0
- [ ] No console errors in browser
- [ ] Responsive design works on mobile/tablet

---

## 🚀 Post-Update Actions

1. **Update System Property** (optional):
```javascript
gs.setProperty('x_1310794_founda_0.version', '1.3.0');
gs.setProperty('x_1310794_founda_0.doc.last_updated', '2026-01-17');
```

2. **Notify Users**:
   - Send email to FHA users about updated documentation
   - Announce in team channel/Slack
   - Update any external documentation links

3. **Update README.md**:
   - Update version number to 1.3.0
   - Add link to CONSOLIDATED_DOCUMENTATION.md
   - Mention obsolete components cleanup

4. **Archive Old Versions**:
   - Export v1.1.1-doc widget as XML (backup)
   - Store in `archive/widgets/` folder

---

## 📞 Support

For questions or issues:
- **Project Owner**: Wilfried Waret
- **Documentation**: CONSOLIDATED_DOCUMENTATION.md
- **Troubleshooting**: See widget Troubleshooting section

---

**Document Version**: 1.0  
**Created**: 2026-01-17  
**Last Updated**: 2026-01-17  
**Widget Target Version**: 1.3.0

