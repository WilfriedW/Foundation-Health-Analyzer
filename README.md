# Foundation Health Analyzer (FHA)

## 📋 Overview

Foundation Health Analyzer is a ServiceNow scoped application designed to analyze the health and configuration of ServiceNow tables. It provides detailed insights into table structure, customizations, business rules, automation, integrations, and potential issues.

**Application Scope:** `x_1310794_founda_0`  
**Version:** 1.0.0

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Service Portal (UI Layer)                    │
│  ┌─────────────────┐  ┌──────────────────────────────────────┐  │
│  │   FHA Dashboard │  │       FHA Analysis Results           │  │
│  │     Widget      │  │            Widget                    │  │
│  └────────┬────────┘  └──────────────────┬───────────────────┘  │
└───────────┼──────────────────────────────┼──────────────────────┘
            │                              │
            ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FHAnalyzer (Entry Point)                    │
│  - getAvailableAnalyses()                                        │
│  - runAnalysis(configSysId)                                      │
│  - getAnalysisResult(sysId)                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FHAnalysisEngine                             │
│  - Orchestrates analysis execution                               │
│  - Runs registered checks via FHCheckRegistry                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
┌───────────────────┐ ┌───────────────┐ ┌───────────────────┐
│   FHCheckTable    │ │FHCheckAutomation│ │ FHCheckIntegration│
│   - Fields        │ │ - Scheduled Jobs│ │ - Data Sources    │
│   - Business Rules│ │ - Flows         │ │ - Transform Maps  │
│   - Client Scripts│ │ - Workflows     │ │                   │
│   - UI Actions    │ │ - Notifications │ │                   │
└───────────────────┘ └───────────────┘ └───────────────────┘
            │                │                │
            └────────────────┼────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FHAnalysisContext                             │
│  - Stores issues, metrics, and analysis state                    │
│  - addIssue(code, message, severity, metadata)                   │
│  - addMetric(key, value)                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

### Active Components (Used)

#### Script Includes (`/update/`)

| File | Class Name | Purpose | Status |
|------|------------|---------|--------|
| `sys_script_include_f27265808316321083e1b4a6feaad33d.xml` | **FHAnalyzer** | Main entry point for analysis | ✅ Active |
| `sys_script_include_62f58e88831a321083e1b4a6feaad34f.xml` | **FHAnalysisEngine** | Orchestrates check execution | ✅ Active |
| `sys_script_include_820602c8831a321083e1b4a6feaad34d.xml` | **FHCheckRegistry** | Registry for check modules | ✅ Active |
| `sys_script_include_f17a0204835a321083e1b4a6feaad360.xml` | **FHAnalysisContext** | Stores analysis results/issues | ✅ Active |
| `sys_script_include_99f80240835a321083e1b4a6feaad361.xml` | **FHCheckTable** | Table-specific checks (fields, BR, CS) | ✅ Active |
| `sys_script_include_7209c240835a321083e1b4a6feaad310.xml` | **FHCheckAutomation** | Automation checks (jobs, flows, WF) | ✅ Active |
| `sys_script_include_16190640835a321083e1b4a6feaad322.xml` | **FHCheckIntegration** | Integration checks (DS, TM) | ✅ Active |
| `sys_script_include_f3d6ef848316721083e1b4a6feaad324.xml` | **FHFieldExplorer** | Field analysis utilities | ✅ Active |

#### Service Portal Widgets

| File | Widget Name | Purpose |
|------|-------------|---------|
| `sp_widget_223611488392321083e1b4a6feaad3db.xml` | **FHA Dashboard** | Main dashboard with analysis controls |
| `sp_widget_9f5755c88392321083e1b4a6feaad3de.xml` | **FHA Analysis Results** | Detailed analysis results view |
| `sp_widget_6ef73b088396721083e1b4a6feaad3d0.xml` | **FHA Custom Fields Viewer** | Custom fields display |

#### Service Portal Pages

| File | Page ID | Title |
|------|---------|-------|
| `sp_page_9c28514c8392321083e1b4a6feaad34a.xml` | `fha_homepage` | FHA Homepage |
| `sp_page_5ac0e61483dab21083e1b4a6feaad3b5.xml` | `fha_analysis_results` | FHA Analysis Results |

#### REST API Endpoints

| File | Endpoint | Method | Purpose |
|------|----------|--------|---------|
| `sys_ws_definition_8add5d0883d2321083e1b4a6feaad355.xml` | Base API Definition | - | Foundation Health Analyzer API |
| `sys_ws_operation_f950a58c83d2321083e1b4a6feaad3c1.xml` | `/tables` | GET | List available tables |
| `sys_ws_operation_793161008316321083e1b4a6feaad360.xml` | `/analyze/{table_name}` | POST | Analyze by table name |
| `sys_ws_operation_dfecb14883d6321083e1b4a6feaad35b.xml` | `/analyze_by_config/{config_sys_id}` | POST | Analyze by config ID |
| `sys_ws_operation_877169008316321083e1b4a6feaad3d8.xml` | `/analysis/{analysis_id}` | GET | Get analysis result |
| `sys_ws_operation_e9352d088316321083e1b4a6feaad345.xml` | `/statistics` | GET | Get global statistics |
| `sys_ws_operation_db15adc48316321083e1b4a6feaad3f7.xml` | `/history` | GET | Get analysis history |
| `sys_ws_operation_5f8fbbc483d6721083e1b4a6feaad309.xml` | `/fields` | GET | Get fields info |
| `sys_ws_operation_acb121408316321083e1b4a6feaad36c.xml` | `/report/word` | POST | Generate Word report |

### Deprecated/Unused Components (`/author_elective_update/`)

These files are in `author_elective_update` which means they were created but are **not actively used** in the current implementation. They can be safely removed or kept for future development:

| File | Class Name | Purpose | Recommendation |
|------|------------|---------|----------------|
| `sys_script_include_cf64d1448392321083e1b4a6feaad3a7.xml` | **FoundationHealthAnalyzer** | Old monolithic analyzer | ❌ **Remove** - Replaced by FHAnalyzer |
| `sys_script_include_71655d848392321083e1b4a6feaad34e.xml` | **ReportGenerator** | Word/PDF report generation | ⚠️ **Keep** - Future use for reports |
| `sys_script_include_b73642c8831a321083e1b4a6feaad3f3.xml` | **FHCheckTableExistence** | Check if table exists | ⚠️ **Keep** - Could be useful |
| `sys_script_include_ea460ac8831a321083e1b4a6feaad3d9.xml` | **FHCheckRecordCount** | Count records in table | ⚠️ **Keep** - Could be useful |
| `sp_widget_d4b79dc88392321083e1b4a6feaad3f2.xml` | Old widget | Unknown purpose | ❌ **Remove** |
| `sp_widget_a06375448396321083e1b4a6feaad334.xml` | Old widget | Unknown purpose | ❌ **Remove** |

---

## 📊 Data Model

### Tables

#### `x_1310794_founda_0_fha_configuration`

Configuration table for defining which tables to analyze.

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Configuration name |
| `table_reference` | Reference (sys_db_object) | Target table to analyze |
| `description` | String | Description |
| `active` | Boolean | Is configuration active |
| `include_children_tables` | Boolean | Include child tables |
| `analyze_references` | Boolean | Analyze reference fields |
| `deep_scan` | Boolean | Perform deep scan |

#### `x_1310794_founda_0_fha_results`

Stores analysis results.

| Field | Type | Description |
|-------|------|-------------|
| `number` | String | Auto-generated (FHAR0001XXX) |
| `table_name` | Reference (sys_db_object) | Analyzed table |
| `health_score` | Integer | Health score (0-100) |
| `issue_found` | Integer | Number of issues found |
| `status` | Choice | Analysis status |
| `detail_json` | String (4000) | Full analysis JSON |
| `summary` | String | Analysis summary |
| `report_generated` | Boolean | Report generated flag |
| `report_document_id` | String | Report document ID |

---

## 🔍 Analysis Checks

### FHCheckTable

Analyzes table-specific elements:

- **Custom Fields**: Lists all custom fields with fill rates
- **Business Rules**: Active/inactive BR count, identifies issues
- **Client Scripts**: Active/inactive CS count
- **UI Actions**: Lists UI actions on the table
- **ACLs**: Security configuration

**Issues Detected:**
- `EMPTY_FIELD` - Custom field with 0% fill rate
- `LOW_FILL_RATE` - Custom field with <10% fill rate
- `INACTIVE_BR` - Inactive business rules
- `NO_CONDITION_BR` - Business rules without conditions
- `COMPLEX_SCRIPT` - Scripts exceeding complexity threshold

### FHCheckAutomation

Analyzes automation elements:

- **Scheduled Jobs**: Jobs related to the table
- **Flows**: Flow Designer flows
- **Workflows**: Legacy workflows
- **Notifications**: Email notifications

**Issues Detected:**
- `INACTIVE_JOB` - Inactive scheduled jobs
- `INACTIVE_FLOW` - Inactive flows
- `INACTIVE_WORKFLOW` - Inactive workflows
- `INACTIVE_NOTIFICATION` - Inactive notifications

### FHCheckIntegration

Analyzes integration elements:

- **Data Sources**: Import data sources
- **Transform Maps**: Data transformation maps

**Issues Detected:**
- `INACTIVE_DATASOURCE` - Inactive data sources
- `INACTIVE_TRANSFORM` - Inactive transform maps
- `NO_FIELD_MAPS` - Transform maps without field mappings

---

## 🎨 User Interface

### Service Portal

**Portal URL:** `/fha`

**Pages:**
1. **Dashboard** (`/fha` or `/fha?id=fha_homepage`)
   - Select table configuration
   - Run analysis
   - View recent analyses
   - Quick stats overview

2. **Analysis Results** (`/fha?id=fha_analysis_results&sys_id=XXX`)
   - Health score display
   - Issues by severity
   - Tabs: Overview, Issues, Fields, Automation, Integrations
   - Filters for Automation/Integration items
   - Color-coded type badges
   - Export to PDF/JSON

### Navigation Menu

**FHA Menu** (`sp_instance_menu_c4c9950083d2321083e1b4a6feaad3b6`)
- Dashboard link

---

## 🔐 Security

### Roles

| Role | Description |
|------|-------------|
| `x_1310794_founda_0.admin` | Full access to FHA |
| `x_1310794_founda_0.user` | Read access to FHA |

### ACLs

ACLs are configured for both tables:
- Read/Write/Create/Delete on `fha_configuration`
- Read/Write/Create/Delete on `fha_results`

---

## 🚀 API Usage

### Base URL
```
https://<instance>.service-now.com/api/x_1310794_founda_0/fha
```

### Endpoints

#### Get Available Tables
```http
GET /api/x_1310794_founda_0/fha/tables
```

#### Run Analysis by Config
```http
POST /api/x_1310794_founda_0/fha/analyze_by_config/{config_sys_id}
```

#### Get Analysis Result
```http
GET /api/x_1310794_founda_0/fha/analysis/{sys_id}
```

#### Get Statistics
```http
GET /api/x_1310794_founda_0/fha/statistics
```

#### Get History
```http
GET /api/x_1310794_founda_0/fha/history?limit=10&offset=0
```

---

## 📝 Health Score Calculation

The health score is calculated based on issues found:

```javascript
score = 100;
for each issue:
  if (severity === 'high')   score -= 15;
  if (severity === 'medium') score -= 5;
  if (severity === 'low')    score -= 2;

return Math.max(0, score);
```

**Score Interpretation:**
- 🟢 **70-100**: Good health
- 🟡 **40-69**: Needs attention
- 🔴 **0-39**: Critical issues

---

## 🌐 Internationalization (i18n)

The application is prepared for translation using ServiceNow's i18n markers:
- All UI strings use `${...}` syntax
- Translatable via System Localization

---

## 🔧 Configuration

### System Properties

| Property | Default | Description |
|----------|---------|-------------|
| `x_1310794_founda_0.debug` | false | Enable debug logging |

### Adding New Checks

To add a new check module:

1. Create a new Script Include extending the check pattern
2. Register it in `FHCheckRegistry`
3. Implement the `run(ctx)` method

```javascript
var FHCheckCustom = Class.create();
FHCheckCustom.prototype = {
    initialize: function() {},
    
    run: function(ctx) {
        // Your check logic here
        ctx.addIssue('CUSTOM_ISSUE', 'Description', 'medium', {
            record_table: 'table_name',
            record_sys_id: 'xxx',
            category: 'custom'
        });
        ctx.addMetric('custom_count', 42);
    },
    
    type: 'FHCheckCustom'
};
```

---

## 📦 Installation

1. Import the application via Source Control or Update Set
2. Assign roles to users
3. Create configurations in `fha_configuration` table
4. Access the portal at `/fha`

---

## 🐛 Troubleshooting

### Common Issues

1. **"Table name is not defined"**
   - Ensure `table_reference` field is populated in configuration

2. **"Analysis not found"**
   - The sys_id in URL must match an existing `fha_results` record

3. **Empty results in Analysis Results page**
   - Run a new analysis - old analyses may not have `detail_json` populated

4. **Incorrect active/inactive status**
   - The `active` field check handles multiple formats: `'true'`, `'1'`, `true`

---

## 📄 License

Proprietary - All rights reserved

---

## 👥 Contributors

- Development: AI-assisted development with Claude (Anthropic)
- Project Owner: Wilfried Waret

---

## 📅 Changelog

### v1.0.0 (2026-01-03)
- Initial release
- Table analysis (fields, BR, CS, UI Actions)
- Automation analysis (jobs, flows, workflows, notifications)
- Integration analysis (data sources, transform maps)
- Service Portal dashboard and results page
- REST API endpoints
- PDF/JSON export
- Color-coded type badges
- Filtering for Automation/Integration tabs

