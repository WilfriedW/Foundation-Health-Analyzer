# Foundation Health Analyzer (FHA) - Complete Documentation

> **Version:** 1.2.0  
> **Scope:** `x_1310794_founda_0`  
> **Last Updated:** 2026-01-17  
> **Portal Access:** `/fha?id=fha_documentation`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Components Inventory](#components-inventory)
5. [Data Model](#data-model)
6. [Configuration Options](#configuration-options)
7. [Analysis Workflow](#analysis-workflow)
8. [REST API Reference](#rest-api-reference)
9. [Service Portal Widgets](#service-portal-widgets)
10. [Health Score Calculation](#health-score-calculation)
11. [Issue Rules System](#issue-rules-system)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)
14. [Migration & Upgrade](#migration--upgrade)
15. [Changelog](#changelog)

---

## Overview

Foundation Health Analyzer (FHA) is a comprehensive ServiceNow scoped application designed to analyze, monitor, and assess the health of ServiceNow tables and their associated components. It provides detailed insights into:

- **Table Structure**: Custom fields, fill rates, references
- **Automation**: Business Rules, Client Scripts, Flows, Workflows
- **Integration**: Data Sources, Transform Maps, REST APIs
- **Security**: ACLs, roles, security configurations
- **Quality**: Script analysis, best practices validation

### Key Features

✅ **Comprehensive Analysis**: Table structure, automation, integration, and security  
✅ **Flexible Configuration**: Multiple analysis modes (basic, deep scan, hierarchical)  
✅ **Rule-Based Detection**: 29 built-in handlers + custom rule engine  
✅ **REST API**: Full API for automation and integration  
✅ **Service Portal UI**: Modern, responsive dashboard and results viewer  
✅ **Health Scoring**: 0-100 score based on severity-weighted issues  
✅ **Exportable Reports**: JSON and Word document generation  
✅ **Internationalization**: Full i18n support for multi-language deployment

### Target Audience

- **ServiceNow Administrators**: Monitor instance health, identify technical debt
- **Developers**: Quality assurance, code review automation
- **Architects**: Foundation assessment, governance compliance
- **Consultants**: Health checks, migration planning

---

## Quick Start

### Installation

1. Import the application via Source Control or Update Set
2. Assign roles to users:
   - `x_1310794_founda_0.admin` - Full access
   - `x_1310794_founda_0.user` - Read-only access
3. Create configurations in `x_1310794_founda_0_configurations` table
4. Access the portal at `/fha`

### Running Your First Analysis

```javascript
// Via Script Background
var analyzer = new x_1310794_founda_0.FHAnalyzer();
var result = analyzer.runAnalysis("CONFIG_SYS_ID_HERE");
gs.info("Health Score: " + result.health_score);
gs.info("Issues Found: " + result.issues_found);
```

```bash
# Via REST API
POST /api/x_1310794_founda_0/fha/analyze/incident
Content-Type: application/json
Authorization: Basic <credentials>

{
  "deep_scan": true,
  "include_children_tables": false
}
```

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Service Portal (UI Layer)                      │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │FHA Dashboard │  │  FHA Analysis    │  │      FHA         │  │
│  │              │  │     Detail       │  │  Documentation   │  │
│  └──────┬───────┘  └────────┬─────────┘  └──────────────────┘  │
└─────────┼────────────────────┼─────────────────────────────────┘
          │                    │
          ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FHAnalyzer (Entry Point)                      │
│  - getAvailableAnalyses()                                        │
│  - runAnalysis(configSysId)                                      │
│  - getAnalysisResult(sysId)                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FHAnalysisEngine                           │
│  - runVerification(configRecord)                                 │
│  - Orchestrates execution via Rule Evaluator                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FHARuleEvaluator                            │
│  - evaluate(item, rules, context)                                │
│  - 29 Built-in Handlers (inactive, system_created, etc.)        │
│  - Custom Script Execution                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Component Layers

#### 1. **UI Layer** (Service Portal)

- **Widgets**: Dashboard, Analysis Detail, Results, Documentation
- **Technology**: AngularJS, Bootstrap, Font Awesome
- **Features**: Responsive design, real-time filtering, scroll-spy navigation

#### 2. **Business Logic Layer** (Script Includes)

- **FHAnalyzer**: Main entry point, configuration management
- **FHAnalysisEngine**: Verification execution, result aggregation
- **FHARuleEvaluator**: Rule evaluation, issue detection
- **FHCheckRegistry**: Module registry (legacy, inactive)

#### 3. **Data Layer** (Custom Tables)

- **Configurations**: Analysis configurations with options
- **Verification Items**: Query definitions, field selection
- **Issue Rules**: Detection rules with handlers
- **Results**: Analysis results with JSON details

#### 4. **Integration Layer** (REST API)

- **8 Endpoints**: Complete CRUD and analysis operations
- **Authentication**: Role-based access control
- **Format**: JSON responses with consistent error handling

---

## Components Inventory

### Script Includes (Active)

| Name                 | File                                                      | Purpose                                 | Status    |
| -------------------- | --------------------------------------------------------- | --------------------------------------- | --------- |
| **FHAnalyzer**       | `sys_script_include_f27265808316321083e1b4a6feaad33d.xml` | Main entry point for analysis           | ✅ Active |
| **FHAnalysisEngine** | `sys_script_include_033a4751531a3610c7233ee0a0490e0f.xml` | Orchestrates verification execution     | ✅ Active |
| **FHARuleEvaluator** | `sys_script_include_cccafeed53163610c7233ee0a0490abc.xml` | Rule evaluation engine with 29 handlers | ✅ Active |

### Script Includes (Inactive/Legacy)

| Name               | File                                                      | Reason               | Recommendation                      |
| ------------------ | --------------------------------------------------------- | -------------------- | ----------------------------------- |
| FHCheckTable       | `sys_script_include_99f80240835a321083e1b4a6feaad361.xml` | Legacy architecture  | ❌ Remove - Replaced by rule system |
| FHCheckAutomation  | `sys_script_include_7209c240835a321083e1b4a6feaad310.xml` | Legacy architecture  | ❌ Remove - Replaced by rule system |
| FHCheckIntegration | `sys_script_include_16190640835a321083e1b4a6feaad322.xml` | Legacy architecture  | ❌ Remove - Replaced by rule system |
| FHCheckSecurity    | `sys_script_include_268399a08392361083e1b4a6feaad34e.xml` | Legacy architecture  | ❌ Remove - Replaced by rule system |
| FHCheckRegistry    | `sys_script_include_820602c8831a321083e1b4a6feaad34d.xml` | Legacy architecture  | ❌ Remove - Not used                |
| FHAnalysisContext  | `sys_script_include_f17a0204835a321083e1b4a6feaad360.xml` | Legacy architecture  | ❌ Remove - Not used                |
| FHScanUtils        | `sys_script_include_df241fac8352761083e1b4a6feaad360.xml` | Legacy utilities     | ❌ Remove - Not used                |
| FHAUtils           | `sys_script_include_65cdccfc831a761083e1b4a6feaad30c.xml` | Legacy utilities     | ❌ Remove - Not used                |
| FHOptionsHandler   | `sys_script_include_62f58e88831a321083e1b4a6feaad34f.xml` | Legacy configuration | ❌ Remove - Not used                |

**Total**: 3 active, 9 inactive (can be safely removed)

### Service Portal Widgets

| Widget Name          | ID                     | File                                             | Purpose                                              |
| -------------------- | ---------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| FHA Dashboard        | `fha_dashboard`        | `sp_widget_223611488392321083e1b4a6feaad3db.xml` | Main analysis dashboard with configuration selection |
| FHA Analysis Detail  | `fha_analysis_detail`  | `sp_widget_3ee88bd48312f21083e1b4a6feaad39a.xml` | Detailed analysis results with tabs and filters      |
| FHA Documentation    | `fha-documentation`    | `sp_widget_5ada939c8392f21083e1b4a6feaad360.xml` | Interactive documentation widget                     |
| FHA Analysis Results | `fha_analysis_results` | `sp_widget_9f5755c88392321083e1b4a6feaad3de.xml` | Analysis results display (legacy)                    |

**Note**: `fha_analysis_results` and `fha_analysis_detail` serve similar purposes. Consider consolidating.

### REST API Endpoints

| Method | Endpoint                             | Purpose                           | File                                                    |
| ------ | ------------------------------------ | --------------------------------- | ------------------------------------------------------- |
| GET    | `/fields`                            | Get custom fields with fill rates | `sys_ws_operation_5f8fbbc483d6721083e1b4a6feaad309.xml` |
| POST   | `/analyze/{table_name}`              | Run analysis by table name        | `sys_ws_operation_793161008316321083e1b4a6feaad360.xml` |
| POST   | `/analyze_by_config/{config_sys_id}` | Run analysis by configuration     | `sys_ws_operation_dfecb14883d6321083e1b4a6feaad35b.xml` |
| GET    | `/analysis/{analysis_id}`            | Get analysis result               | `sys_ws_operation_877169008316321083e1b4a6feaad3d8.xml` |
| GET    | `/tables`                            | List available configurations     | `sys_ws_operation_f950a58c83d2321083e1b4a6feaad3c1.xml` |
| GET    | `/history`                           | Get analysis history              | `sys_ws_operation_db15adc48316321083e1b4a6feaad3f7.xml` |
| GET    | `/statistics`                        | Get global statistics             | `sys_ws_operation_e9352d088316321083e1b4a6feaad345.xml` |
| POST   | `/report/word`                       | Generate Word report              | `sys_ws_operation_acb121408316321083e1b4a6feaad36c.xml` |

**Base URL**: `https://<instance>.service-now.com/api/x_1310794_founda_0/fha`

### Service Portal Pages

| Page Title           | Page ID                | File                                           | Widgets Used        |
| -------------------- | ---------------------- | ---------------------------------------------- | ------------------- |
| FHA Homepage         | `fha_homepage`         | `sp_page_9c28514c8392321083e1b4a6feaad34a.xml` | FHA Dashboard       |
| FHA Documentation    | `fha_documentation`    | `sp_page_277a975c8392f21083e1b4a6feaad318.xml` | FHA Documentation   |
| FHA Analysis Results | `fha_analysis_results` | `sp_page_5ac0e61483dab21083e1b4a6feaad3b5.xml` | FHA Analysis Detail |

---

## Data Model

### Table: `x_1310794_founda_0_configurations`

**Purpose**: Stores analysis configurations (what to analyze, which options to enable)

| Field                       | Type                      | Description                           |
| --------------------------- | ------------------------- | ------------------------------------- |
| `name`                      | String                    | Configuration name                    |
| `table`                     | Reference (sys_db_object) | Target table to analyze               |
| `active`                    | Boolean                   | Is configuration active               |
| `description`               | String                    | Configuration description             |
| `deep_scan`                 | Boolean                   | Enable script content analysis        |
| `include_children_tables`   | Boolean                   | Include child tables in analysis      |
| `include_ldap`              | Boolean                   | Include LDAP-related checks           |
| `ignore_servicenow_records` | Boolean                   | Ignore OOB ServiceNow records         |
| `verification_items`        | List (Glide List)         | List of verification items to execute |

### Table: `x_1310794_founda_0_verification_items`

**Purpose**: Defines what data to query and which rules to apply

| Field          | Type                      | Description                                      |
| -------------- | ------------------------- | ------------------------------------------------ |
| `name`         | String                    | Verification item name                           |
| `category`     | Choice                    | Category (automation, integration, security, UI) |
| `table`        | Reference (sys_db_object) | Table to query                                   |
| `query_type`   | Choice                    | Query type (encoded, script)                     |
| `query_value`  | String (1000)             | Encoded query string                             |
| `query_script` | String (4000)             | Custom query script                              |
| `fields`       | String (1000)             | Comma-separated list of fields to retrieve       |
| `issue_rules`  | List (Glide List)         | List of issue rules to apply                     |
| `metadata`     | String (4000)             | JSON metadata for custom processing              |
| `active`       | Boolean                   | Is verification item active                      |

### Table: `x_1310794_founda_0_issue_rules`

**Purpose**: Defines detection rules with handlers and custom scripts

| Field         | Type          | Description                                   |
| ------------- | ------------- | --------------------------------------------- |
| `name`        | String        | Rule name                                     |
| `code`        | String        | Unique rule code (e.g., "UNUSED_FIELD")       |
| `type`        | Choice        | Handler type (inactive, system_created, etc.) |
| `severity`    | Choice        | Severity (high, medium, low)                  |
| `description` | String (4000) | Rule description                              |
| `params`      | String (4000) | JSON parameters for handler                   |
| `script`      | String (8000) | Custom JavaScript for rule logic              |
| `active`      | Boolean       | Is rule active                                |

### Table: `x_1310794_founda_0_results`

**Purpose**: Stores analysis results

| Field           | Type                      | Description                           |
| --------------- | ------------------------- | ------------------------------------- |
| `number`        | String                    | Auto-generated (FHAR0001XXX)          |
| `state`         | Choice                    | State (In Progress, Completed, Error) |
| `details`       | String (JSON)             | Full analysis details in JSON         |
| `table_name`    | Reference (sys_db_object) | Analyzed table                        |
| `health_score`  | Integer                   | Health score (0-100)                  |
| `issue_found`   | Integer                   | Number of issues found                |
| `configuration` | Reference                 | Link to configuration                 |

---

## Configuration Options

### Basic Options

| Option                      | Type    | Default | Description                                                              |
| --------------------------- | ------- | ------- | ------------------------------------------------------------------------ |
| `deep_scan`                 | Boolean | false   | Enable script content analysis (detects eval(), hardcoded sys_ids, etc.) |
| `include_children_tables`   | Boolean | false   | Include child tables in analysis (e.g., incident → task)                 |
| `include_ldap`              | Boolean | false   | Include LDAP-related checks (sys_user, sys_user_group)                   |
| `ignore_servicenow_records` | Boolean | true    | Ignore OOB ServiceNow records (sys_created_by = system)                  |

### Configuration Matrix

| Scenario                | deep_scan | include_children | include_ldap | Use Case                          |
| ----------------------- | --------- | ---------------- | ------------ | --------------------------------- |
| **Quick Health Check**  | ❌        | ❌               | ❌           | Fast overview, basic metrics      |
| **Standard Analysis**   | ✅        | ❌               | ❌           | Recommended for most tables       |
| **Full Table Family**   | ✅        | ✅               | ❌           | Analyze table + all children      |
| **Identity Management** | ✅        | ✅               | ✅           | sys_user, sys_user_group analysis |

---

## Analysis Workflow

### Step-by-Step Process

```
1. Configuration Selection
   ↓
2. Verification Items Loading
   ↓
3. Query Execution (encoded query or script)
   ↓
4. Data Retrieval (fields specified in verification item)
   ↓
5. Rule Evaluation (via FHARuleEvaluator)
   ↓
6. Issue Detection (built-in handlers + custom scripts)
   ↓
7. Result Aggregation
   ↓
8. Health Score Calculation
   ↓
9. Result Storage (x_1310794_founda_0_results)
   ↓
10. Display in Service Portal or return via API
```

### Execution Flow (Detailed)

```javascript
// 1. User initiates analysis
var analyzer = new x_1310794_founda_0.FHAnalyzer();
var configSysId = "abc123...";

// 2. Load configuration
var config = analyzer._loadConfiguration(configSysId);

// 3. Get verification items
var items = config.verification_items;

// 4. For each verification item
items.forEach(function (item) {
  // 5. Execute query (encoded or script)
  var records = analyzer._executeQuery(item);

  // 6. Load issue rules for this item
  var rules = item.issue_rules;

  // 7. For each record
  records.forEach(function (record) {
    // 8. Evaluate rules
    var evaluator = new x_1310794_founda_0.FHARuleEvaluator();
    var issues = evaluator.evaluate(record, rules, context);

    // 9. Collect issues
    allIssues.push(issues);
  });
});

// 10. Calculate health score
var score = analyzer._calculateHealthScore(allIssues);

// 11. Save result
var result = analyzer._saveResult(config, allIssues, score);

// 12. Return result
return {
  success: true,
  analysis_id: result.sys_id,
  health_score: score,
  issues_count: allIssues.length,
};
```

---

## REST API Reference

### Authentication

All endpoints require HTTP Basic Authentication with appropriate roles:

- `x_1310794_founda_0.admin` - Full access
- `x_1310794_founda_0.user` - Read-only access

### Base URL

```
https://<instance>.service-now.com/api/x_1310794_founda_0/fha
```

### Endpoints

#### GET /tables

List all available table configurations for analysis.

**Request:**

```http
GET /api/x_1310794_founda_0/fha/tables
Authorization: Basic <credentials>
```

**Response (200):**

```json
{
  "success": true,
  "count": 3,
  "tables": [
    {
      "config_sys_id": "abc123...",
      "display_name": "Incident Analysis",
      "table_name": "incident",
      "table_label": "Incident",
      "description": "Full incident table analysis"
    }
  ]
}
```

#### POST /analyze/{table_name}

Run health analysis on a table by its name.

**Request:**

```http
POST /api/x_1310794_founda_0/fha/analyze/incident
Content-Type: application/json
Authorization: Basic <credentials>

{
  "deep_scan": true,
  "include_children": false
}
```

**Response (200):**

```json
{
  "success": true,
  "analysis_id": "abc123def456...",
  "health_score": 75,
  "issues_count": 12,
  "message": "Analysis completed",
  "details_url": "/api/x_1310794_founda_0/fha/analysis/abc123def456..."
}
```

#### POST /analyze_by_config/{config_sys_id}

Run health analysis using a specific configuration sys_id.

**Request:**

```http
POST /api/x_1310794_founda_0/fha/analyze_by_config/abc123def456
Authorization: Basic <credentials>
```

**Response (200):**

```json
{
  "success": true,
  "status": "COMPLETED",
  "analysis_id": "xyz789...",
  "health_score": 75,
  "issues_found": 8,
  "duration": 3,
  "timestamp": "2026-01-17 10:30:00"
}
```

#### GET /analysis/{analysis_id}

Get detailed analysis results by analysis sys_id.

**Request:**

```http
GET /api/x_1310794_founda_0/fha/analysis/abc123def456
Authorization: Basic <credentials>
```

**Response (200):**

```json
{
  "success": true,
  "analysis": {
    "sys_id": "abc123def456",
    "table_name": "incident",
    "health_score": 75,
    "issues_count": 12,
    "status": "completed",
    "created_on": "2026-01-17 10:30:00",
    "issues": [
      {
        "code": "UNUSED_FIELD",
        "message": "Custom field 'u_custom' has 0% fill rate",
        "severity": "high",
        "category": "field",
        "metadata": {}
      }
    ],
    "metrics": {
      "custom_field_count": 15,
      "active_br_count": 8
    }
  }
}
```

#### GET /fields

Get custom fields for a table with fill rate statistics.

**Request:**

```http
GET /api/x_1310794_founda_0/fha/fields?table_name=incident
Authorization: Basic <credentials>
```

**Response (200):**

```json
{
  "success": true,
  "table_name": "incident",
  "count": 5,
  "fields": [
    {
      "name": "u_custom_field",
      "label": "Custom Field",
      "type": "string",
      "fill_rate": 85,
      "filled_records": 850,
      "total_records": 1000
    }
  ]
}
```

#### GET /history

Get paginated history of all analyses.

**Query Parameters:**

- `limit` (Integer, default: 20, max: 100) - Number of records
- `offset` (Integer, default: 0) - Pagination offset
- `table_name` (String, optional) - Filter by table name
- `status` (String, optional) - Filter by status

**Request:**

```http
GET /api/x_1310794_founda_0/fha/history?limit=10&offset=0
Authorization: Basic <credentials>
```

**Response (200):**

```json
{
  "success": true,
  "total": 42,
  "limit": 10,
  "offset": 0,
  "history": [
    {
      "sys_id": "abc123...",
      "number": "FHAR0001042",
      "table_name": "Incident",
      "health_score": 85,
      "issues_count": 5,
      "status": "completed",
      "created_on": "2026-01-17 10:30:00"
    }
  ]
}
```

#### GET /statistics

Get global statistics about configurations and analyses.

**Request:**

```http
GET /api/x_1310794_founda_0/fha/statistics
Authorization: Basic <credentials>
```

**Response (200):**

```json
{
  "success": true,
  "statistics": {
    "configurations": {
      "total": 5,
      "active": 3
    },
    "analyses": {
      "total": 42,
      "completed": 40,
      "failed": 2,
      "average_health_score": 72
    }
  }
}
```

#### POST /report/word

Generate a structured report for Word/PDF export.

**Request:**

```http
POST /api/x_1310794_founda_0/fha/report/word
Content-Type: application/json
Authorization: Basic <credentials>

{
  "analysis_sys_id": "abc123def456..."
}
```

**Response (200):**

```json
{
  "success": true,
  "report": {
    "meta": {
      "title": "Foundation Health Analysis Report",
      "table_name": "incident",
      "analysis_date": "2026-01-17 10:30:00"
    },
    "summary": {
      "health_score": 75,
      "issues_count": 12
    },
    "recommendations": [...]
  }
}
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description",
  "statusCode": 404
}
```

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 400         | Bad Request - Missing required parameters |
| 404         | Not Found - Resource not found            |
| 500         | Internal Server Error                     |

---

## Service Portal Widgets

### FHA Dashboard Widget

**File**: `sp_widget_223611488392321083e1b4a6feaad3db.xml`  
**ID**: `fha_dashboard`  
**Lines**: ~1380

**Purpose**: Main dashboard for configuration selection and analysis execution

**Features**:

- Configuration selector dropdown
- "Run Analysis" button
- Recent analyses list with direct links
- Loading states and error handling
- Real-time result updates

**Client-side Methods**:

- `runAnalysis()` - Initiates analysis
- `loadResult(analysisId)` - Loads existing result
- `refreshRecentAnalyses()` - Updates recent list

### FHA Analysis Detail Widget

**File**: `sp_widget_3ee88bd48312f21083e1b4a6feaad39a.xml`  
**ID**: `fha_analysis_detail`  
**Lines**: ~927

**Purpose**: Detailed analysis results with tabs and filters

**Features**:

- Multi-tab interface (Overview, Issues, JSON)
- Severity filtering (high, medium, low, all)
- Search functionality
- Type filtering for automation/integration
- Color-coded severity badges
- Export to JSON

**Client-side Methods**:

- `setTab(tab)` - Switch between tabs
- `getFilteredIssues()` - Apply filters
- `sortBy(field, dir)` - Sort issues
- `exportJSON()` - Export results

### FHA Documentation Widget

**File**: `sp_widget_5ada939c8392f21083e1b4a6feaad360.xml`  
**ID**: `fha-documentation`  
**Lines**: ~1084

**Purpose**: Interactive in-portal documentation

**Features**:

- 10 sections with scroll-spy navigation
- Sticky navigation bar
- Smooth scroll to sections
- IntersectionObserver for active section tracking
- Code blocks with syntax highlighting
- Responsive design

**Client-side Methods**:

- `setSection(section)` - Set active section
- `scrollToSection(sectionId)` - Navigate to section
- `goToDashboard()` - Return to dashboard

**Sections**:

1. Description
2. Installation
3. Configuration
4. Options
5. Scores
6. Checks
7. Architecture
8. API
9. Best Practices
10. Resources

---

## Health Score Calculation

### Formula

```javascript
score = 100;

for each issue:
  if (severity === 'high')   score -= 15;
  if (severity === 'medium') score -= 5;
  if (severity === 'low')    score -= 2;

return Math.max(0, score);
```

### Score Interpretation

| Score Range | Status             | Color  | Guidance                        |
| ----------- | ------------------ | ------ | ------------------------------- |
| 70 - 100    | ✅ Good            | Green  | Monitor and address minor items |
| 40 - 69     | ⚠️ Needs Attention | Yellow | Plan medium/high remediations   |
| 0 - 39      | ❌ Critical        | Red    | Immediate action on high issues |

### Examples

**Example 1: Light Issues**

- 2 low severity issues → Score = 100 - (2×2) = **96** (Good)

**Example 2: Mixed Issues**

- 1 high severity → -15
- 3 medium severity → -15
- 5 low severity → -10
- Total: Score = 100 - 40 = **60** (Needs Attention)

**Example 3: Critical State**

- 5 high severity → -75
- Total: Score = 100 - 75 = **25** (Critical)

---

## Issue Rules System

### Built-in Handlers (29 Handlers)

FHARuleEvaluator provides 29 built-in handlers for common issue detection:

#### 1. **inactive**

- **Severity**: Low
- **Detects**: Records with `active=false`
- **Params**: None
- **Message**: "Inactive record: {name}. Consider activating or removing if no longer needed."

#### 2. **system_created**

- **Severity**: Info
- **Detects**: Records created by 'system' user
- **Params**: None
- **Message**: "Record created by system user."

#### 3. **missing_field**

- **Severity**: Medium
- **Detects**: Records missing a required field
- **Params**: `{ "field": "field_name" }`
- **Message**: "Missing required field: {field}"

#### 4. **unused_field**

- **Severity**: High
- **Detects**: Custom fields with 0% fill rate
- **Params**: `{ "field": "field_name", "fill_rate": 0 }`
- **Message**: "Field '{field}' has 0% fill rate (never used)"

#### 5. **low_fill_rate**

- **Severity**: Medium
- **Detects**: Fields with fill rate < threshold
- **Params**: `{ "field": "field_name", "fill_rate": 5, "threshold": 10 }`
- **Message**: "Field '{field}' has low fill rate: {fill_rate}% (threshold: {threshold}%)"

#### 6. **duplicate_field**

- **Severity**: Medium
- **Detects**: Custom field duplicating OOTB field
- **Params**: `{ "custom_field": "u_status", "ootb_field": "state" }`
- **Message**: "Custom field '{custom_field}' may duplicate OOTB field '{ootb_field}'"

#### 7. **hardcoded_sys_id**

- **Severity**: High (deep_scan required)
- **Detects**: Hardcoded sys_ids in scripts
- **Params**: None
- **Message**: "Script contains hardcoded sys_id: {sys_id}"

#### 8. **eval_usage**

- **Severity**: Critical (deep_scan required)
- **Detects**: `eval()` usage in scripts
- **Params**: None
- **Message**: "Script uses eval() - security risk"

#### 9. **console_log**

- **Severity**: Low (deep_scan required)
- **Detects**: `console.log()` instead of `gs.log()`
- **Params**: None
- **Message**: "Script uses console.log - use gs.log instead"

#### 10. **current_update**

- **Severity**: Critical (deep_scan required)
- **Detects**: `current.update()` in Business Rules
- **Params**: None
- **Message**: "Business Rule uses current.update() - recursion risk"

#### 11-29. **Additional Handlers**

- `size_threshold` - Records exceeding size limit
- `count_threshold` - Records exceeding count threshold
- `br_density` - Too many Business Rules per table
- `inactive_workflow` - Inactive workflows
- `no_read_acl` - Missing read ACL
- `no_write_acl` - Missing write ACL
- `orphan_reference` - References to deleted records
- `invalid_reference` - References to non-existent tables
- `failed_imports` - Failed import sets
- `gs_sleep` - `gs.sleep()` usage
- `sync_ajax` - Synchronous AJAX calls
- `query_no_limit` - GlideRecord without setLimit()
- `pattern_scan` - Custom pattern matching
- `field_check` - Custom field validation
- `aggregate_metric` - Aggregate metric calculation
- **... (full list in HANDLERS_REFERENCE.md)**

### Custom Rules

You can create custom rules with JavaScript:

```javascript
// In Issue Rule record
// Type: custom
// Script:
var issues = [];
var recordName = item.values.name || "Unknown";
var createdBy = item.values.sys_created_by || "";

// Custom logic
if (createdBy.indexOf("admin") === -1 && createdBy !== "system") {
  issues.push(
    this._issue(
      rule,
      'Record "' + recordName + '" created by non-admin user: ' + createdBy,
      {
        created_by: createdBy,
        record_table: item.table,
        record_sys_id: item.sys_id,
      }
    )
  );
}

return issues;
```

### Rule Parameters

Rules can accept JSON parameters:

```json
{
  "field": "priority",
  "threshold": 10,
  "condition": "equals",
  "value": "1",
  "message_template": "High priority record without assignment"
}
```

---

## Best Practices

### For Administrators

#### Performance Optimization

- ✅ **Start with basic analysis** before enabling deep_scan
- ✅ **Use include_children_tables** only when necessary
- ✅ **Schedule analyses** during off-peak hours for large tables
- ✅ **Archive old results** to keep results table manageable

#### Configuration Management

- ✅ **Create separate configurations** for different analysis types
- ✅ **Name configurations clearly** (e.g., "Incident - Weekly Full Scan")
- ✅ **Document configuration purposes** in description field
- ✅ **Keep configurations active/inactive** based on usage

#### Security

- ✅ **Restrict admin role** to authorized users only
- ✅ **Use user role** for read-only access
- ✅ **Review ACLs** on custom tables
- ✅ **Enable debug logging** only for troubleshooting

### For Developers

#### Extending FHA

- ✅ **Create custom Issue Rules** instead of modifying core scripts
- ✅ **Use metadata field** in verification items for custom data
- ✅ **Test custom rules** on non-production instances first
- ✅ **Document custom handlers** in rule description

#### Integration

- ✅ **Use REST API** for automation
- ✅ **Implement error handling** for API calls
- ✅ **Cache configuration data** when making multiple analyses
- ✅ **Monitor API quotas** and rate limits

#### Code Quality

- ✅ **Follow ServiceNow best practices** in custom scripts
- ✅ **Avoid hardcoding sys_ids** in rules
- ✅ **Use try-catch blocks** for error handling
- ✅ **Log errors with gs.error()** for debugging

### General Recommendations

#### Analysis Frequency

- **Daily**: Critical production tables (incident, change_request)
- **Weekly**: Standard tables with moderate activity
- **Monthly**: Reference tables, configuration tables
- **Quarterly**: Historical/archived tables

#### Issue Prioritization

1. **Critical/High severity** - Address immediately
2. **Medium severity** - Plan remediation within sprint/release
3. **Low severity** - Document for future cleanup

#### Monitoring

- Set up **notifications** for critical health scores (< 40)
- Create **dashboards** to track health trends over time
- Review **top issues** monthly with development team

---

## Troubleshooting

### Common Issues

#### 1. "Configuration not found" Error

**Symptom**: Analysis fails with "Configuration not found"  
**Cause**: Configuration record is inactive or deleted  
**Solution**:

```javascript
// Verify configuration exists and is active
var config = new GlideRecord("x_1310794_founda_0_configurations");
config.addQuery("sys_id", "YOUR_CONFIG_SYS_ID");
config.addQuery("active", true);
config.query();
if (!config.next()) {
  gs.error("Configuration not found or inactive");
}
```

#### 2. Empty Results in Analysis Detail

**Symptom**: Analysis completes but no data shows in widget  
**Cause**: `details` field not populated in results record  
**Solution**:

- Run a new analysis (old analyses may not have JSON details)
- Check browser console for JavaScript errors
- Verify `details` field contains valid JSON

#### 3. Slow Analysis Performance

**Symptom**: Analysis takes >5 minutes to complete  
**Cause**: Large table + deep_scan enabled + children tables  
**Solution**:

- Disable `deep_scan` for initial runs
- Set `include_children_tables=false`
- Add filters to verification items (encoded query)
- Run analysis during off-peak hours

#### 4. Missing Issues from Rules

**Symptom**: Expected issues not detected by rules  
**Cause**: Rule inactive, wrong handler type, or params mismatch  
**Solution**:

```javascript
// Verify rule is active and correctly configured
var rule = new GlideRecord("x_1310794_founda_0_issue_rules");
rule.get("RULE_SYS_ID");
gs.info("Rule active: " + rule.active);
gs.info("Rule type: " + rule.type);
gs.info("Rule params: " + rule.params);
```

#### 5. REST API 403 Forbidden

**Symptom**: API calls return 403 error  
**Cause**: Missing role or incorrect authentication  
**Solution**:

- Verify user has `x_1310794_founda_0.admin` or `x_1310794_founda_0.user` role
- Check HTTP Basic Auth credentials
- Review REST API ACLs

### Debug Mode

Enable debug logging:

```javascript
// Set system property
gs.setProperty("x_1310794_founda_0.debug", "true");

// View logs in System Logs
// Filter: source=x_1310794_founda_0
```

### Log Analysis

```javascript
// Find recent analyses
var result = new GlideRecord("x_1310794_founda_0_results");
result.orderByDesc("sys_created_on");
result.setLimit(10);
result.query();
while (result.next()) {
  gs.info(
    "Analysis: " +
      result.number +
      " | Score: " +
      result.health_score +
      " | State: " +
      result.state
  );
}
```

---

## Migration & Upgrade

### Upgrading from 1.0.0 to 1.2.0

#### Pre-Migration Checklist

- ✅ **Backup current configurations** (export to XML)
- ✅ **Document custom modifications** (if any)
- ✅ **Review active analyses** (note configurations in use)
- ✅ **Test on non-production** instance first

#### Migration Steps

1. **Import Update Set** (or pull from Source Control)
2. **Verify Script Includes**:
   - FHAnalyzer (active)
   - FHAnalysisEngine (active)
   - FHARuleEvaluator (active)
3. **Update Configurations**:
   - Review new fields: `deep_scan`, `include_children_tables`, etc.
   - Update existing configurations as needed
4. **Create Verification Items**:
   - Define verification items for each configuration
   - Link issue rules to verification items
5. **Test Analysis**:
   - Run test analysis on small table
   - Verify results display correctly
   - Check API endpoints

#### Breaking Changes

**1.0.0 → 1.1.0**

- Architecture changed from Check modules (FHCheckTable, etc.) to Rule-based system
- Old check modules marked inactive
- Configurations now use `verification_items` instead of direct check execution

**1.1.0 → 1.2.0**

- Documentation widget redesigned (backward compatible)
- New REST endpoints added (no breaking changes)
- Issue rules table structure unchanged

#### Rollback Procedure

If migration fails:

1. **Revert Update Set** (if using Update Sets)
2. **Restore Configuration Backup**
3. **Clear Result Table** (optional):

```javascript
var result = new GlideRecord("x_1310794_founda_0_results");
result.addQuery("sys_created_on", ">", "MIGRATION_DATE");
result.deleteMultiple();
```

---

## Changelog

### [1.2.0] - 2026-01-17

#### Added

- ✨ **Consolidated Documentation**: Single source of truth for all FHA documentation
- ✨ **Component Inventory**: Complete list of active/inactive components with recommendations
- ✨ **Enhanced Widget Documentation**: Detailed documentation for all 4 Service Portal widgets
- ✨ **Migration Guide**: Step-by-step upgrade instructions
- ✨ **Troubleshooting Section**: Common issues and solutions
- ✨ **Best Practices**: Recommendations for admins and developers

#### Changed

- 📝 Updated architecture diagrams with current component structure
- 📝 Revised REST API documentation with complete examples
- 📝 Expanded issue rules documentation with all 29 handlers
- 📝 Improved health score explanation with examples

#### Deprecated

- ⚠️ 9 legacy Script Includes marked for removal (FHCheckTable, FHCheckAutomation, etc.)
- ⚠️ Consider consolidating FHA Analysis Results and FHA Analysis Detail widgets

### [1.1.1-doc] - 2026-01-14

- FHA Documentation widget: scroll-spy navigation
- Version/date read via system properties

### [1.1.0] - 2026-01-04

- Configuration options (deep_scan, include_children_tables, analyze_references)
- Deep scan - script quality analysis
- Rule-based architecture (FHARuleEvaluator with 29 handlers)

### [1.0.0] - 2026-01-03

- Initial release
- Table analysis (fields, BR, CS)
- Service Portal dashboard and results page
- REST API endpoints
- Check-based architecture (FHCheckTable, FHCheckAutomation, FHCheckIntegration)

---

## Additional Resources

### Documentation Files

| Document           | Purpose                | Location                               |
| ------------------ | ---------------------- | -------------------------------------- |
| README.md          | Quick overview         | `/README.md`                           |
| Architecture       | Technical architecture | `/docs/architecture.md`                |
| Handlers Reference | Complete handler list  | `/docs/handlers/HANDLERS_REFERENCE.md` |
| Scripts Library    | Reusable scripts       | `/docs/handlers/SCRIPTS_LIBRARY.md`    |
| Quick Reference    | One-page cheat sheet   | `/docs/handlers/QUICK_REFERENCE.md`    |
| Migration Guide    | Upgrade instructions   | `/docs/MIGRATION_GUIDE_v2.md`          |

### Key Files

| File                     | Path                                               | Purpose              |
| ------------------------ | -------------------------------------------------- | -------------------- |
| FHAnalyzer               | `d852.../update/sys_script_include_f272658...xml`  | Main analyzer        |
| FHAnalysisEngine         | `d852.../update/sys_script_include_033a475...xml`  | Analysis engine      |
| FHARuleEvaluator         | `d852.../update/sys_script_include_cccafeed...xml` | Rule evaluator       |
| FHA Dashboard Widget     | `d852.../update/sp_widget_223611488...xml`         | Dashboard widget     |
| FHA Documentation Widget | `d852.../update/sp_widget_5ada939c...xml`          | Documentation widget |

### Portal Access

- **Dashboard**: `/fha` or `/fha?id=fha_homepage`
- **Documentation**: `/fha?id=fha_documentation`
- **Analysis Results**: `/fha?id=fha_analysis_results&sys_id=RESULT_SYS_ID`

### Support

For questions, issues, or contributions:

- **Project Owner**: Wilfried Waret
- **Documentation**: This file + `/docs/` folder
- **Source Control**: Check repository for latest updates

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-17  
**Application Version**: 1.2.0  
**Maintained By**: FHA Development Team
