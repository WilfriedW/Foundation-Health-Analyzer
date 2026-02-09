# 🧹 Cleanup: Remove base_query from Configurations

## 🎯 Issue

Duplicate field: `base_query` exists on both:
- ❌ Configuration (unnecessary)
- ✅ Verification Item (used for analysis)
- ✅ Template (used to populate VI)

---

## ✅ Solution

**Remove** `base_query` from **Configurations** table.

### Why?

1. **Query is used from Verification Item**, not Configuration
2. **Template populates VI**, not Configuration
3. **Configuration doesn't need to store it**
4. **Reduces data duplication**

---

## 📊 Data Flow (Correct)

```
Template
├── base_query = "active=true^sys_packageISNOTEMPTY"
└── ...

  ↓ createFromTemplate()

Verification Item
├── query_value = "active=true^sys_packageISNOTEMPTY"  ← Copied from template
└── ...

  ↓ FHAnalysisEngine uses VI.query_value

Configuration
└── (no base_query needed) ✅
```

---

## 🔧 Actions Required

### Step 1: Delete/Deactivate Field in ServiceNow

**Option A: Delete (Recommended)**
1. Navigate to: **System Definition > Tables**
2. Search: `x_1310794_founda_0_configurations`
3. Tab: **Columns**
4. Find: `base_query`
5. Open record
6. Check **Delete**
7. **Update**

**Option B: Deactivate (Safer)**
1. Same steps as above
2. Uncheck **Active** instead of deleting
3. **Update**

### Step 2: Update Script Include

The script has already been updated to NOT set `config.base_query`.

File: `scripts/FHTemplateManager_v2.js` (current version)

---

## ✅ Result

### Before
```javascript
Configuration {
  name: "My Config",
  table: "sys_script",
  base_query: "active=true",  ← DUPLICATE
  verification_items: [vi_id]
}

Verification Item {
  name: "My VI",
  query_value: "active=true"  ← DUPLICATE
}
```

### After
```javascript
Configuration {
  name: "My Config",
  table: "sys_script",
  // No base_query ✅
  verification_items: [vi_id]
}

Verification Item {
  name: "My VI",
  query_value: "active=true"  ← SINGLE SOURCE OF TRUTH
}
```

---

## 🎯 Benefits

- ✅ **Simpler data model**
- ✅ **Single source of truth** (query in VI only)
- ✅ **No duplication**
- ✅ **Clearer responsibilities**

---

## 📝 Notes

### Keep base_query on Template

Template still has `base_query` to pre-populate Verification Items.

This is correct because:
- Template is a **blueprint**
- VI is the **actual query used**
- Configuration is just a **container**

### Migration

If you have existing configurations with `base_query` populated:
- They won't break (field just ignored)
- You can leave them as-is
- Or clean up the data:

```javascript
// Optional cleanup
var gr = new GlideRecord('x_1310794_founda_0_configurations');
gr.addQuery('base_query', '!=', '');
gr.query();
gs.info('Configs with base_query: ' + gr.getRowCount());
```

---

**Version**: 2.1  
**Date**: 2026-02-09  
**Status**: ✅ Data model simplified
