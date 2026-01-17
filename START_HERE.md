# 🚀 Foundation Health Analyzer - Start Here

> **Welcome to FHA!** This guide will help you get started quickly.

---

## 📍 You Are Here

You've just accessed the **Foundation Health Analyzer (FHA)** application. This is your starting point to understand, use, and maintain the application.

---

## 🎯 What is FHA?

Foundation Health Analyzer is a comprehensive ServiceNow application that:

✅ **Analyzes** ServiceNow tables for health and quality  
✅ **Detects** issues using 29 built-in rule handlers  
✅ **Scores** table health from 0-100  
✅ **Reports** findings via Service Portal and REST API  
✅ **Recommends** fixes and best practices  

**Portal Access**: `/fha` or `/fha?id=fha_homepage`  
**Documentation**: `/fha?id=fha_documentation`

---

## 📚 Documentation Roadmap

### 🟢 Getting Started (5 minutes)

**Start here if you're new to FHA:**

1. **Read this file** (START_HERE.md) - You are here! ✅
2. **Quick Overview** - See "Quick Start" below
3. **Access Portal** - Navigate to `/fha`
4. **Run First Analysis** - Select a configuration and click "Run Analysis"

### 🟡 Learning FHA (30 minutes)

**For users who want to understand FHA:**

1. **[CONSOLIDATED_DOCUMENTATION.md](CONSOLIDATED_DOCUMENTATION.md)** - Read sections:
   - Overview
   - Quick Start
   - Configuration Options
   - Analysis Workflow
   - Health Score Calculation

### 🔵 Mastering FHA (2-3 hours)

**For admins and developers:**

1. **[CONSOLIDATED_DOCUMENTATION.md](CONSOLIDATED_DOCUMENTATION.md)** - Complete reading
2. **[docs/handlers/HANDLERS_REFERENCE.md](docs/handlers/HANDLERS_REFERENCE.md)** - Learn all 29 handlers
3. **[docs/handlers/SCRIPTS_LIBRARY.md](docs/handlers/SCRIPTS_LIBRARY.md)** - Copy ready-to-use scripts
4. **[WIDGET_UPDATE_INSTRUCTIONS.md](WIDGET_UPDATE_INSTRUCTIONS.md)** - Update documentation widget

### 🟣 Advanced Topics

**For experts and architects:**

1. **[OBSOLETE_COMPONENTS_CLEANUP.md](OBSOLETE_COMPONENTS_CLEANUP.md)** - Clean up 9 inactive components
2. **[docs/handlers/ARCHITECTURE.md](docs/handlers/ARCHITECTURE.md)** - Technical architecture
3. **[docs/MIGRATION_GUIDE_v2.md](docs/MIGRATION_GUIDE_v2.md)** - Upgrade from v1.0 to v1.3

---

## ⚡ Quick Start

### Option 1: Use Service Portal (Recommended)

```bash
1. Navigate to: /fha
2. Select a configuration from dropdown
3. Click "Run Analysis"
4. View results when complete
```

### Option 2: Use REST API

```bash
POST /api/x_1310794_founda_0/fha/analyze/incident
Content-Type: application/json
Authorization: Basic <credentials>

{
  "deep_scan": true
}
```

### Option 3: Use Script Background

```javascript
var analyzer = new x_1310794_founda_0.FHAnalyzer();
var result = analyzer.runAnalysis('CONFIG_SYS_ID_HERE');
gs.info('Health Score: ' + result.health_score);
```

---

## 📦 What's Included

### Active Components (Keep)

| Component | Purpose | File |
|-----------|---------|------|
| **FHAnalyzer** | Main entry point | `sys_script_include_f27265808...xml` |
| **FHAnalysisEngine** | Orchestrates execution | `sys_script_include_033a4751...xml` |
| **FHARuleEvaluator** | 29 rule handlers | `sys_script_include_cccafeed...xml` |
| **FHA Dashboard** | Main UI | `sp_widget_223611488...xml` |
| **FHA Analysis Detail** | Results viewer | `sp_widget_3ee88bd48...xml` |
| **FHA Documentation** | This widget | `sp_widget_5ada939c...xml` |
| **8 REST APIs** | Automation | `sys_ws_operation_*...xml` |

### Obsolete Components (Remove)

**9 inactive Script Includes** identified for removal:
- FHCheckTable, FHCheckAutomation, FHCheckIntegration (replaced by rule system)
- FHCheckSecurity, FHCheckRegistry, FHAnalysisContext (not used)
- FHOptionsHandler, FHScanUtils, FHAUtils (utilities moved)

**See**: [OBSOLETE_COMPONENTS_CLEANUP.md](OBSOLETE_COMPONENTS_CLEANUP.md) for cleanup instructions.

---

## 🗺️ Documentation Map

```
Foundation-Health-Analyzer/
│
├── 📄 START_HERE.md                          ⭐ YOU ARE HERE
├── 📄 CONSOLIDATED_DOCUMENTATION.md          📚 COMPLETE GUIDE (50+ pages)
├── 📄 OBSOLETE_COMPONENTS_CLEANUP.md         🧹 Cleanup guide
├── 📄 WIDGET_UPDATE_INSTRUCTIONS.md          🔧 Widget update
├── 📄 DOCUMENTATION_OVERHAUL_SUMMARY.md      📊 Summary
│
├── 📄 README.md                               📖 Technical README
├── 📄 CHANGELOG.md                            📝 Version history
│
└── 📁 docs/                                   📂 Additional docs
    ├── 📄 architecture.md
    ├── 📁 handlers/                           (29 handlers documented)
    ├── 📁 features/
    ├── 📁 api/
    └── 📁 guides/
```

---

## 🎯 Common Tasks

### I want to...

| Task | Go to... |
|------|----------|
| **Run my first analysis** | Portal: `/fha` |
| **Understand FHA completely** | [CONSOLIDATED_DOCUMENTATION.md](CONSOLIDATED_DOCUMENTATION.md) |
| **Learn all 29 rule handlers** | [docs/handlers/HANDLERS_REFERENCE.md](docs/handlers/HANDLERS_REFERENCE.md) |
| **Get ready-to-use scripts** | [docs/handlers/SCRIPTS_LIBRARY.md](docs/handlers/SCRIPTS_LIBRARY.md) |
| **Integrate via REST API** | [CONSOLIDATED_DOCUMENTATION.md § REST API](CONSOLIDATED_DOCUMENTATION.md#rest-api-reference) |
| **Troubleshoot an issue** | [CONSOLIDATED_DOCUMENTATION.md § Troubleshooting](CONSOLIDATED_DOCUMENTATION.md#troubleshooting) |
| **Update the documentation widget** | [WIDGET_UPDATE_INSTRUCTIONS.md](WIDGET_UPDATE_INSTRUCTIONS.md) |
| **Clean up obsolete components** | [OBSOLETE_COMPONENTS_CLEANUP.md](OBSOLETE_COMPONENTS_CLEANUP.md) |
| **Upgrade from v1.0 to v1.3** | [docs/MIGRATION_GUIDE_v2.md](docs/MIGRATION_GUIDE_v2.md) |

---

## ✅ Prerequisites

Before using FHA:

1. **Roles**: You need `x_1310794_founda_0.admin` or `x_1310794_founda_0.user` role
2. **Access**: Service Portal must be enabled on your instance
3. **Configuration**: At least one configuration must exist in `x_1310794_founda_0_configurations` table

---

## 🆘 Need Help?

### Common Issues

1. **"Configuration not found"**  
   → Ensure configuration is active in `x_1310794_founda_0_configurations` table

2. **Empty results in widget**  
   → Run a new analysis (old analyses may not have JSON details)

3. **Slow analysis (>5 minutes)**  
   → Disable `deep_scan` for initial runs, set `include_children_tables=false`

4. **REST API 403 Forbidden**  
   → Verify you have `x_1310794_founda_0.admin` or `.user` role

**See**: [CONSOLIDATED_DOCUMENTATION.md § Troubleshooting](CONSOLIDATED_DOCUMENTATION.md#troubleshooting) for more solutions.

---

## 📞 Support

- **Project Owner**: Wilfried Waret
- **Complete Documentation**: [CONSOLIDATED_DOCUMENTATION.md](CONSOLIDATED_DOCUMENTATION.md)
- **Portal Documentation**: `/fha?id=fha_documentation`

---

## 🎉 What's New in v1.3.0

✅ **Consolidated documentation** (50+ pages, single source of truth)  
✅ **Component inventory** (complete list of active/obsolete components)  
✅ **Cleanup guide** (remove 9 inactive Script Includes, -47% codebase)  
✅ **Enhanced widget** (12 sections, components, troubleshooting)  
✅ **Complete API docs** (8 endpoints with full examples)  
✅ **Troubleshooting guide** (5+ common issues with solutions)  

**See**: [CHANGELOG.md](CHANGELOG.md) for complete version history.

---

## 🚀 Next Steps

### 1. Read Documentation (30 minutes)
→ [CONSOLIDATED_DOCUMENTATION.md](CONSOLIDATED_DOCUMENTATION.md)

### 2. Run Your First Analysis (10 minutes)
→ Navigate to `/fha`

### 3. Update Documentation Widget (30 minutes)
→ [WIDGET_UPDATE_INSTRUCTIONS.md](WIDGET_UPDATE_INSTRUCTIONS.md)

### 4. Clean Up Obsolete Components (2-4 weeks)
→ [OBSOLETE_COMPONENTS_CLEANUP.md](OBSOLETE_COMPONENTS_CLEANUP.md)

---

**Version**: 1.3.0  
**Last Updated**: 2026-01-17  
**Status**: ✅ Production Ready

**Happy Analyzing! 🎯**

