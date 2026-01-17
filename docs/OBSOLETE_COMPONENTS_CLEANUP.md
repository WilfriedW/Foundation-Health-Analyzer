# Obsolete Components Cleanup Guide

> **Version:** 1.0  
> **Date:** 2026-01-17  
> **Application:** Foundation Health Analyzer (FHA)  
> **Scope:** `x_1310794_founda_0`

---

## 📋 Executive Summary

This document identifies **9 inactive Script Includes** and **potential widget consolidation** opportunities in the Foundation Health Analyzer application. These components can be safely removed to reduce technical debt and improve maintainability.

### Impact Summary

| Category | Count | Action | Impact |
|----------|-------|--------|--------|
| **Inactive Script Includes** | 9 | Remove | Low risk - marked `active=false` |
| **Duplicate Widgets** | 2 | Consolidate | Medium risk - verify usage first |
| **Author Elective Scripts** | 5+ | Archive | No risk - not in production |
| **Total Components** | 16+ | Cleanup | Reduces codebase by ~30% |

---

## 🎯 Cleanup Priority Matrix

### High Priority (Remove First)

| Component | File | Reason | Risk |
|-----------|------|--------|------|
| FHCheckTable | `sys_script_include_99f80240835a321083e1b4a6feaad361.xml` | Replaced by rule system | 🟢 Low |
| FHCheckAutomation | `sys_script_include_7209c240835a321083e1b4a6feaad310.xml` | Replaced by rule system | 🟢 Low |
| FHCheckIntegration | `sys_script_include_16190640835a321083e1b4a6feaad322.xml` | Replaced by rule system | 🟢 Low |
| FHCheckRegistry | `sys_script_include_820602c8831a321083e1b4a6feaad34d.xml` | Not used in current architecture | 🟢 Low |

### Medium Priority (Remove After Testing)

| Component | File | Reason | Risk |
|-----------|------|--------|------|
| FHCheckSecurity | `sys_script_include_268399a08392361083e1b4a6feaad34e.xml` | Replaced by rule system | 🟡 Medium |
| FHAnalysisContext | `sys_script_include_f17a0204835a321083e1b4a6feaad360.xml` | Not used in current architecture | 🟡 Medium |
| FHOptionsHandler | `sys_script_include_62f58e88831a321083e1b4a6feaad34f.xml` | Not used in current architecture | 🟡 Medium |

### Low Priority (Archive Only)

| Component | File | Reason | Risk |
|-----------|------|--------|------|
| FHScanUtils | `sys_script_include_df241fac8352761083e1b4a6feaad360.xml` | Utility functions moved to rules | 🟢 Low |
| FHAUtils | `sys_script_include_65cdccfc831a761083e1b4a6feaad30c.xml` | Utility functions moved to rules | 🟢 Low |

---

## 📦 Detailed Component Analysis

### 1. Inactive Script Includes (9 Components)

These Script Includes have `<active>false</active>` in their XML and are not referenced by active components.

#### FHCheckTable
- **File**: `sys_script_include_99f80240835a321083e1b4a6feaad361.xml`
- **Purpose**: Legacy table analysis module
- **Status**: ❌ Inactive
- **Replaced By**: FHARuleEvaluator with verification items
- **References**: None (grep shows 0 active references)
- **Action**: **DELETE**
- **Impact**: None - not called by any active code

```javascript
// Verification query (run in Scripts - Background)
var gr = new GlideRecord('sys_script_include');
gr.addQuery('api_name', 'x_1310794_founda_0.FHCheckTable');
gr.query();
if (gr.next()) {
    gs.info('Active: ' + gr.active); // Should show 'false'
    gs.info('Last updated: ' + gr.sys_updated_on);
}
```

#### FHCheckAutomation
- **File**: `sys_script_include_7209c240835a321083e1b4a6feaad310.xml`
- **Purpose**: Legacy automation analysis module
- **Status**: ❌ Inactive
- **Replaced By**: FHARuleEvaluator with verification items
- **Action**: **DELETE**

#### FHCheckIntegration
- **File**: `sys_script_include_16190640835a321083e1b4a6feaad322.xml`
- **Purpose**: Legacy integration analysis module
- **Status**: ❌ Inactive
- **Replaced By**: FHARuleEvaluator with verification items
- **Action**: **DELETE**

#### FHCheckSecurity
- **File**: `sys_script_include_268399a08392361083e1b4a6feaad34e.xml`
- **Purpose**: Legacy security analysis module
- **Status**: ❌ Inactive
- **Replaced By**: FHARuleEvaluator with verification items
- **Action**: **DELETE**

#### FHCheckRegistry
- **File**: `sys_script_include_820602c8831a321083e1b4a6feaad34d.xml`
- **Purpose**: Legacy registry for check modules
- **Status**: ❌ Inactive
- **Replaced By**: Verification items configuration
- **Action**: **DELETE**

#### FHAnalysisContext
- **File**: `sys_script_include_f17a0204835a321083e1b4a6feaad360.xml`
- **Purpose**: Legacy context management
- **Status**: ❌ Inactive
- **Replaced By**: Passed as parameter in new architecture
- **Action**: **DELETE**

#### FHOptionsHandler
- **File**: `sys_script_include_62f58e88831a321083e1b4a6feaad34f.xml`
- **Purpose**: Legacy options management
- **Status**: ❌ Inactive
- **Replaced By**: Configuration table fields
- **Action**: **DELETE**

#### FHScanUtils
- **File**: `sys_script_include_df241fac8352761083e1b4a6feaad360.xml`
- **Purpose**: Legacy scan utilities
- **Status**: ❌ Inactive
- **Replaced By**: Utility functions in FHARuleEvaluator
- **Action**: **DELETE**

#### FHAUtils
- **File**: `sys_script_include_65cdccfc831a761083e1b4a6feaad30c.xml`
- **Purpose**: Legacy utility functions
- **Status**: ❌ Inactive
- **Replaced By**: Utility functions in FHARuleEvaluator
- **Action**: **DELETE**

---

### 2. Author Elective Update Components (5+ Components)

These components are in `author_elective_update` folder, which means they were created during development but are **not part of the production update set**.

| Component | File | Status |
|-----------|------|--------|
| FoundationHealthAnalyzer | `sys_script_include_cf64d1448392321083e1b4a6feaad3a7.xml` | ❌ Archive |
| ReportGenerator | `sys_script_include_71655d848392321083e1b4a6feaad34e.xml` | ⚠️ Keep (future use) |
| FHCheckTableExistence | `sys_script_include_b73642c8831a321083e1b4a6feaad3f3.xml` | ⚠️ Keep (future use) |
| FHCheckRecordCount | `sys_script_include_ea460ac8831a321083e1b4a6feaad3d9.xml` | ⚠️ Keep (future use) |
| Old Widget (d4b...) | `sp_widget_d4b79dc88392321083e1b4a6feaad3f2.xml` | ❌ Archive |
| Old Widget (a06...) | `sp_widget_a06375448396321083e1b4a6feaad334.xml` | ❌ Archive |

**Recommendation**: Move `author_elective_update` folder to `archive/` or delete entirely.

---

### 3. Potential Widget Consolidation

#### Current State
- **FHA Analysis Results** (`sp_widget_9f5755c88392321083e1b4a6feaad3de.xml`)
- **FHA Analysis Detail** (`sp_widget_3ee88bd48312f21083e1b4a6feaad39a.xml`)

Both widgets serve similar purposes: displaying analysis results.

#### Analysis

| Widget | Lines | Features | Used By |
|--------|-------|----------|---------|
| FHA Analysis Results | ~300 | Basic results display | Legacy page |
| FHA Analysis Detail | ~927 | Advanced with tabs, filters, export | Current page |

**Recommendation**: 
- **Keep**: FHA Analysis Detail (more feature-rich)
- **Deprecate**: FHA Analysis Results (superseded)
- **Action**: Update all references to use FHA Analysis Detail

#### Migration Steps
1. Verify no active pages use `sp_widget_9f5755c88392321083e1b4a6feaad3de`
2. Update `sp_page_5ac0e61483dab21083e1b4a6feaad3b5` to use FHA Analysis Detail
3. Mark FHA Analysis Results as inactive
4. After 30 days, delete if no issues

---

## 🛠️ Cleanup Procedure

### Phase 1: Pre-Cleanup (Week 1)

#### Step 1: Document Current State
```javascript
// Export current Script Includes to XML (backup)
// Navigate to: System Definition > Script Includes
// Filter: Scope = x_1310794_founda_0, Active = false
// Right-click header > Export > XML
```

#### Step 2: Verify No References
```javascript
// Run in Scripts - Background
var inactive = [
    'FHCheckTable', 'FHCheckAutomation', 'FHCheckIntegration',
    'FHCheckSecurity', 'FHCheckRegistry', 'FHAnalysisContext',
    'FHOptionsHandler', 'FHScanUtils', 'FHAUtils'
];

inactive.forEach(function(className) {
    var gr = new GlideRecord('sys_script_include');
    gr.addQuery('name', className);
    gr.addQuery('active', true);
    gr.query();
    
    if (gr.next()) {
        gs.warn('WARNING: ' + className + ' is still active!');
    } else {
        gs.info('OK: ' + className + ' is inactive (safe to delete)');
    }
});
```

#### Step 3: Search for Usage
```bash
# Search in all Script Includes for references
cd /path/to/app/update
grep -r "FHCheckTable" *.xml
grep -r "FHCheckAutomation" *.xml
grep -r "FHCheckIntegration" *.xml
# ... repeat for all inactive components

# Should return 0 results (except the component itself)
```

### Phase 2: Cleanup (Week 2-3)

#### Step 1: Delete Inactive Script Includes

```javascript
// Run in Scripts - Background (one at a time)
var scriptName = 'FHCheckTable'; // Change for each component

var gr = new GlideRecord('sys_script_include');
gr.addQuery('api_name', 'x_1310794_founda_0.' + scriptName);
gr.query();

if (gr.next()) {
    if (gr.active == 'false') {
        gs.info('Deleting: ' + scriptName);
        gr.deleteRecord();
        gs.info('Deleted successfully');
    } else {
        gs.error('ERROR: Script is still active! Aborting.');
    }
} else {
    gs.info('Script not found: ' + scriptName);
}
```

**Or manually:**
1. Navigate to **System Definition > Script Includes**
2. Filter by `Scope = x_1310794_founda_0` and `Active = false`
3. Select all 9 inactive Script Includes
4. Right-click > **Delete**
5. Confirm deletion

#### Step 2: Archive Author Elective Components

```bash
# Move author_elective_update folder
cd /path/to/app
mkdir -p archive/2026-01-17
mv d852994c8312321083e1b4a6feaad3e6/author_elective_update archive/2026-01-17/

# Or simply delete if not needed
rm -rf d852994c8312321083e1b4a6feaad3e6/author_elective_update
```

#### Step 3: Consolidate Widgets (Optional)

```javascript
// 1. Verify FHA Analysis Results is not used
var page = new GlideRecord('sp_page');
page.query();
while (page.next()) {
    var containers = page.getValue('sp_containers');
    if (containers && containers.indexOf('9f5755c88392321083e1b4a6feaad3de') > -1) {
        gs.warn('Page uses FHA Analysis Results: ' + page.id);
    }
}

// 2. If no usage found, mark widget as inactive
var widget = new GlideRecord('sp_widget');
widget.get('9f5755c88392321083e1b4a6feaad3de');
if (widget.isValidRecord()) {
    widget.active = false;
    widget.update();
    gs.info('FHA Analysis Results marked inactive');
}
```

### Phase 3: Post-Cleanup Verification (Week 4)

#### Step 1: Test Application
- ✅ Run analysis from dashboard
- ✅ View analysis results
- ✅ Access documentation page
- ✅ Call REST API endpoints
- ✅ Check for JavaScript errors in browser console

#### Step 2: Monitor Logs
```javascript
// Check for errors referencing deleted components
var log = new GlideRecord('syslog');
log.addQuery('source', 'x_1310794_founda_0');
log.addQuery('level', 'error');
log.addQuery('sys_created_on', '>', gs.daysAgo(7));
log.query();

while (log.next()) {
    gs.info('Error: ' + log.message);
}
```

#### Step 3: Update Documentation
- Update README.md (remove references to deleted components)
- Update architecture.md (update component list)
- Update CONSOLIDATED_DOCUMENTATION.md (mark as cleaned)

---

## 📊 Cleanup Impact Assessment

### Before Cleanup

| Component Type | Count | Total Lines | Status |
|----------------|-------|-------------|--------|
| Active Script Includes | 3 | ~1,500 | ✅ Used |
| Inactive Script Includes | 9 | ~2,500 | ❌ Unused |
| Active Widgets | 4 | ~3,400 | ✅ Used |
| Duplicate Widgets | 1 | ~300 | ⚠️ Redundant |
| Author Elective | 5+ | ~1,000 | ❌ Development only |
| **TOTAL** | **22+** | **~8,700** | - |

### After Cleanup

| Component Type | Count | Total Lines | Status |
|----------------|-------|-------------|--------|
| Active Script Includes | 3 | ~1,500 | ✅ Used |
| Active Widgets | 3 | ~3,100 | ✅ Used |
| **TOTAL** | **6** | **~4,600** | - |

### Metrics

- **Components Removed**: 16 (-73%)
- **Code Reduced**: ~4,100 lines (-47%)
- **Maintenance Effort**: Significantly reduced
- **Technical Debt**: Eliminated

---

## 🔒 Rollback Plan

If issues arise after cleanup:

### Immediate Rollback (< 24 hours)

```javascript
// Restore from Update Set (if available)
// Navigate to: System Update Sets > Retrieved Update Sets
// Find: "FHA Cleanup Rollback"
// Click: Preview Update Set > Commit Update Set
```

### Delayed Rollback (> 24 hours)

1. **Restore from XML Export** (created in Phase 1, Step 1)
   - Navigate to **System Update Sets > Retrieved Update Sets**
   - Click **Import XML**
   - Upload backup XML file
   - Preview and Commit

2. **Reactivate Components**
```javascript
// Reactivate a specific Script Include
var scriptName = 'FHCheckTable';
var gr = new GlideRecord('sys_script_include');
gr.addQuery('api_name', 'x_1310794_founda_0.' + scriptName);
gr.query();
if (gr.next()) {
    gr.active = true;
    gr.update();
    gs.info('Reactivated: ' + scriptName);
}
```

---

## ✅ Cleanup Checklist

### Pre-Cleanup
- [ ] Export all inactive Script Includes to XML (backup)
- [ ] Run reference verification script (should show 0 active references)
- [ ] Search codebase for usage with grep/find
- [ ] Document current state (screenshots, configs)
- [ ] Notify team of planned cleanup

### Cleanup
- [ ] Delete 9 inactive Script Includes
- [ ] Archive/delete author_elective_update folder
- [ ] Mark FHA Analysis Results widget as inactive (optional)
- [ ] Commit changes to Source Control
- [ ] Create Update Set for rollback

### Post-Cleanup
- [ ] Test all analysis workflows
- [ ] Test all widgets
- [ ] Test all REST API endpoints
- [ ] Monitor logs for 7 days
- [ ] Update documentation
- [ ] Communicate cleanup completion to team

---

## 📅 Recommended Timeline

| Week | Phase | Activities | Duration |
|------|-------|------------|----------|
| **Week 1** | Pre-Cleanup | Document, verify, backup | 5 days |
| **Week 2** | Cleanup | Delete Script Includes | 2 days |
| **Week 3** | Cleanup | Archive author_elective, consolidate widgets | 3 days |
| **Week 4** | Post-Cleanup | Test, monitor, document | 5 days |
| **TOTAL** | - | - | **3-4 weeks** |

---

## 🎯 Success Criteria

✅ All 9 inactive Script Includes deleted  
✅ Author elective folder archived/deleted  
✅ No errors in application logs  
✅ All analysis workflows functioning  
✅ All REST API endpoints operational  
✅ Documentation updated  
✅ Team notified and trained on new architecture  

---

## 📞 Support & Questions

For questions or issues during cleanup:
- **Project Owner**: Wilfried Waret
- **Documentation**: CONSOLIDATED_DOCUMENTATION.md
- **Rollback Procedure**: See section above

---

**Document Version**: 1.0  
**Created**: 2026-01-17  
**Last Updated**: 2026-01-17  
**Status**: Ready for Review  
**Next Review**: Before cleanup execution

