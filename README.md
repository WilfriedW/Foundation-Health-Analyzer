# Foundation Health Analyzer (FHA)

> A comprehensive ServiceNow scoped application for analyzing table health, detecting configuration issues, and providing actionable recommendations.

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](https://github.com/yourusername/foundation-health-analyzer)
[![ServiceNow](https://img.shields.io/badge/ServiceNow-Tokyo%2B-green.svg)](https://www.servicenow.com/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Core Components](#core-components)
- [Data Model](#data-model)
- [Configuration](#configuration)
- [Analysis Workflow](#analysis-workflow)
- [REST API](#rest-api)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Foundation Health Analyzer (FHA)** is a powerful ServiceNow application designed to help administrators and developers assess the health of their ServiceNow tables and detect potential issues before they become problems.

### What Does It Do?

- **Analyzes** ServiceNow tables for health and configuration quality
- **Detects** issues using a flexible rule-based system (29+ built-in handlers)
- **Scores** table health from 0-100 based on severity of issues found
- **Reports** findings via Service Portal and REST API
- **Recommends** fixes and best practices

### Use Cases

- **Pre-Production Audits**: Validate configurations before deploying to production
- **Technical Debt Assessment**: Identify inactive, unused, or problematic components
- **Compliance Checks**: Ensure security rules (ACLs) are properly configured
- **Performance Optimization**: Detect performance-impacting patterns
- **Documentation**: Auto-generate health reports for stakeholders

---

## ✨ Key Features

### 🔍 Comprehensive Analysis

- **Table Analysis**: Fields, business rules, client scripts, UI components
- **Automation Analysis**: Flows, workflows, scheduled jobs, notifications
- **Integration Analysis**: Data sources, transform maps, REST APIs
- **Security Analysis**: ACLs, user roles, authentication

### 🎛️ Flexible Configuration

- **Verification Items**: Define custom queries and checks
- **Issue Rules**: Create custom detection rules with 29+ built-in handlers
- **Configuration Options**: Deep scan, LDAP inclusion, child tables, ServiceNow record filtering

### 📊 Advanced Reporting

- **Health Score**: 0-100 score based on issue severity
- **Categorized Issues**: Issues grouped by category (automation, integration, security, etc.)
- **Severity Levels**: High, Medium, Low severity classification
- **Export Options**: JSON export for integration with external tools

### 🌐 Service Portal Integration

- **Dashboard Widget**: Run analyses and view recent results
- **Analysis Results Widget**: Detailed view with tabs, filters, and search
- **Documentation Widget**: Built-in documentation accessible from portal

### 🔌 REST API

8 REST API endpoints for automation:
- List available configurations
- Run analyses
- Retrieve results
- Get field statistics
- View history
- Generate reports

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Service Portal (UI Layer)                  │
│   ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│   │ FHA Dashboard│  │ FHA Analysis     │  │ FHA          │  │
│   │   Widget     │  │ Detail Widget    │  │ Documentation│  │
│   └──────┬───────┘  └────────┬─────────┘  └──────────────┘  │
└──────────┼────────────────────┼─────────────────────────────┘
           │                    │
           ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    FHAnalyzer (Entry Point)                  │
│  • runAnalysis(configSysId)                                  │
│  • getConfiguration(configSysId)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    FHAnalysisEngine                          │
│  • runVerification(config)                                   │
│  • Orchestrates query execution                              │
│  • Loads and applies issue rules                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    FHARuleEvaluator                          │
│  • evaluate(item, rules, context)                            │
│  • 29+ built-in rule handlers                                │
│  • Custom script execution support                           │
└─────────────────────────────────────────────────────────────┘
           │                    │
           ▼                    ▼
    ┌──────────────┐    ┌──────────────┐
    │ Issue Rules  │    │Verification  │
    │   Table      │    │  Items Table │
    └──────────────┘    └──────────────┘
```

---

## 🚀 Quick Start

### Portal Access (Recommended)

1. Navigate to: `/fha` or `/fha?id=fha_homepage`
2. Select a configuration from the dropdown
3. Click **"Run Analysis"**
4. View results when analysis completes

### REST API

```bash
curl -X POST \
  https://YOUR_INSTANCE.service-now.com/api/x_1310794_founda_0/fha/analyze/incident \
  -H 'Authorization: Basic <credentials>' \
  -H 'Content-Type: application/json' \
  -d '{
    "deep_scan": true,
    "include_children": false
  }'
```

### Script Background

```javascript
var analyzer = new x_1310794_founda_0.FHAnalyzer();
var result = analyzer.runAnalysis('YOUR_CONFIG_SYS_ID');
gs.info('Health Score: ' + result.details.health_score);
gs.info('Issues Found: ' + result.details.issues.length);
```

---

## 📦 Installation

### Prerequisites

- ServiceNow instance (Tokyo or later recommended)
- Roles: `admin` or `x_1310794_founda_0.admin`
- Service Portal enabled

### Installation Steps

1. **Import Application**
   - Via Update Set: Import the XML files from `d852994c8312321083e1b4a6feaad3e6/update/`
   - Via Source Control: Clone and commit to your instance

2. **Assign Roles**
   ```
   x_1310794_founda_0.admin  - Full access (run analyses, modify configs)
   x_1310794_founda_0.user   - Read-only access (view results)
   ```

3. **Create First Configuration**
   - Navigate to: `x_1310794_founda_0_configurations.list`
   - Create a new configuration
   - Select a table to analyze
   - Add verification items (or use default set)

4. **Access Portal**
   - Navigate to: `/fha`
   - Run your first analysis

---

## 🔧 Core Components

### Script Includes (Active)

| Name | Purpose | Lines | API Name |
|------|---------|-------|----------|
| **FHAnalyzer** | Main entry point | ~300 | `x_1310794_founda_0.FHAnalyzer` |
| **FHAnalysisEngine** | Orchestrates verification execution | ~240 | `x_1310794_founda_0.FHAnalysisEngine` |
| **FHARuleEvaluator** | Evaluates issue rules (29+ handlers) | ~800 | `x_1310794_founda_0.FHARuleEvaluator` |

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `x_1310794_founda_0_configurations` | Analysis configurations | `name`, `table`, `verification_items` |
| `x_1310794_founda_0_verification_items` | Define what to check | `category`, `query_type`, `query_value`, `issue_rules` |
| `x_1310794_founda_0_issue_rules` | Define detection rules | `code`, `type`, `severity`, `params`, `script` |
| `x_1310794_founda_0_results` | Store analysis results | `state`, `details` (JSON), `sys_id` |

### Service Portal Widgets

| Widget | ID | Purpose |
|--------|-----|---------|
| FHA Dashboard | `fha_dashboard` | Main dashboard with configuration selector |
| FHA Analysis Detail | `fha_analysis_detail` | Detailed results with tabs and filters |
| FHA Documentation | `fha-documentation` | Built-in documentation |

### REST API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/tables` | GET | List available configurations |
| `/analyze/{table_name}` | POST | Run analysis by table name |
| `/analyze_by_config/{config_sys_id}` | POST | Run analysis by configuration |
| `/analysis/{analysis_id}` | GET | Get analysis result |
| `/fields` | GET | Get custom fields with fill rates |
| `/history` | GET | Get analysis history (paginated) |
| `/statistics` | GET | Get global statistics |
| `/report/word` | POST | Generate Word/PDF report |

---

## 📊 Data Model

### Configuration Flow

```
Configuration (fha_configurations)
    ├── name: "Incident Analysis"
    ├── table: Reference to sys_db_object
    ├── active: true
    ├── verification_items: [sys_id1, sys_id2, ...]
    │
    └── Verification Items (fha_verification_items)
            ├── name: "Check Business Rules"
            ├── category: "automation"
            ├── query_type: "encoded" | "script"
            ├── query_value: "active=true^collection={0}"
            ├── fields: "name,active,script,sys_created_by"
            ├── issue_rules: [rule_sys_id1, rule_sys_id2, ...]
            │
            └── Issue Rules (fha_issue_rules)
                    ├── code: "BR_TOO_MANY"
                    ├── type: "count_threshold"
                    ├── severity: "medium"
                    ├── params: '{"threshold": 30}'
                    └── script: (optional custom script)
```

### Analysis Result Structure

```json
{
  "config": {
    "sys_id": "...",
    "name": "Incident Analysis",
    "table_name": "incident",
    "verification_items": [...]
  },
  "issues": [
    {
      "code": "BR_TOO_MANY",
      "message": "Table has 45 business rules (threshold: 30)",
      "severity": "medium",
      "category": "automation",
      "details": {
        "record_table": "sys_script",
        "record_sys_id": "...",
        "record_name": "My Business Rule"
      }
    }
  ],
  "categories": {
    "automation": [...],
    "integration": [...],
    "security": [...]
  },
  "execution_metadata": {
    "start_time": "2026-01-17 10:00:00",
    "end_time": "2026-01-17 10:00:05",
    "duration": 5
  }
}
```

---

## ⚙️ Configuration

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `deep_scan` | Boolean | Enable deep script analysis (detects hardcoded sys_ids, eval usage, etc.) |
| `include_children_tables` | Boolean | Include child tables in analysis |
| `include_ldap` | Boolean | Include LDAP-related checks |
| `ignore_servicenow_records` | Boolean | Filter out out-of-box ServiceNow records |

### Creating a Configuration

1. **Navigate to Configurations Table**
   ```
   x_1310794_founda_0_configurations.list
   ```

2. **Create New Configuration**
   - Name: "My Table Analysis"
   - Table: Select target table (e.g., incident)
   - Active: true

3. **Add Verification Items**
   - Select existing verification items OR
   - Create custom verification items

4. **Configure Options** (optional)
   - Enable `deep_scan` for thorough analysis
   - Enable `include_children_tables` to analyze inherited tables

### Creating Verification Items

**Example: Check for Too Many Business Rules**

```
Name: Check Business Rules Count
Category: automation
Query Type: encoded
Query Value: collection={0}^active=true
Table: sys_script
Fields: name,active,script,sys_created_by,sys_updated_by
Issue Rules: [Select "Too Many Business Rules" rule]
```

### Creating Issue Rules

**Example: Detect Inactive Records**

```
Name: Inactive Business Rule
Code: BR_INACTIVE
Type: inactive
Severity: low
Params: {}
Script: (leave empty for built-in handler)
```

**Example: Custom Script Rule**

```
Name: Hardcoded Sys ID Detection
Code: HARDCODED_SYSID
Type: (leave empty)
Severity: medium
Script:
var issues = [];
if (item.values.script) {
    var script = item.values.script;
    var pattern = /[0-9a-f]{32}/gi;
    var matches = script.match(pattern);
    if (matches && matches.length > 0) {
        issues.push({
            code: rule.code,
            message: 'Script contains hardcoded sys_id(s)',
            severity: 'medium',
            details: {
                record_table: item.table,
                record_sys_id: item.sys_id,
                record_name: item.values.name || 'Unnamed',
                sys_ids_found: matches.length
            }
        });
    }
}
return issues;
```

---

## 🔄 Analysis Workflow

### Step-by-Step Process

```
1. User Initiates Analysis
   ├── Via Portal: Click "Run Analysis"
   ├── Via REST API: POST /analyze/{table_name}
   └── Via Script: analyzer.runAnalysis(configSysId)

2. FHAnalyzer.runAnalysis(configSysId)
   ├── Load configuration from database
   ├── Load verification items (active only)
   └── Call FHAnalysisEngine.runVerification(config)

3. FHAnalysisEngine.runVerification(config)
   ├── For each verification item:
   │   ├── Execute query (encoded or script)
   │   ├── Load associated issue rules
   │   ├── For each record found:
   │   │   └── Call FHARuleEvaluator.evaluate(item, rules, context)
   │   └── Collect all issues
   └── Return result with aggregated issues

4. FHARuleEvaluator.evaluate(item, rules, context)
   ├── For each rule:
   │   ├── If rule has custom script: Execute script
   │   ├── Else if rule has type: Execute built-in handler
   │   └── Collect issues returned
   └── Return all issues for this item

5. FHAnalyzer._saveResult(config, result)
   ├── Create new record in x_1310794_founda_0_results
   ├── Set state = "Completed"
   ├── Store full details as JSON in 'details' field
   └── Return result_sys_id

6. Return Result to User
   └── analysis_id, health_score, issues_count
```

### Health Score Calculation

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

## 🌐 REST API

### Base URL

```
https://YOUR_INSTANCE.service-now.com/api/x_1310794_founda_0/fha
```

### Authentication

All endpoints require Basic Authentication with ServiceNow credentials.

### Endpoints

#### GET /tables

List all available table configurations.

**Response:**
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
      "description": "Analysis configuration for incident table"
    }
  ]
}
```

#### POST /analyze/{table_name}

Run analysis on a table by name.

**Request:**
```json
{
  "deep_scan": true,
  "include_children": false
}
```

**Response:**
```json
{
  "success": true,
  "analysis_id": "xyz789...",
  "health_score": 75,
  "issues_count": 12,
  "message": "Analysis completed",
  "details_url": "/api/x_1310794_founda_0/fha/analysis/xyz789..."
}
```

#### POST /analyze_by_config/{config_sys_id}

Run analysis using a specific configuration.

**Response:**
```json
{
  "success": true,
  "status": "COMPLETED",
  "analysis_id": "xyz789...",
  "table_name": "incident",
  "health_score": 75,
  "issues_found": 8,
  "duration": 3,
  "timestamp": "2026-01-17 10:30:00"
}
```

#### GET /analysis/{analysis_id}

Get detailed analysis results.

**Response:**
```json
{
  "success": true,
  "analysis": {
    "sys_id": "xyz789...",
    "table_name": "incident",
    "health_score": 75,
    "issues_count": 12,
    "status": "completed",
    "created_on": "2026-01-17 10:30:00",
    "issues": [
      {
        "code": "BR_TOO_MANY",
        "message": "Too many business rules",
        "severity": "medium",
        "category": "automation"
      }
    ]
  }
}
```

#### GET /fields?table_name={table}

Get custom fields with fill rate statistics.

**Response:**
```json
{
  "success": true,
  "table_name": "incident",
  "table_label": "Incident",
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

Get paginated analysis history.

**Query Parameters:**
- `limit` (default: 20, max: 100)
- `offset` (default: 0)
- `table_name` (optional filter)
- `status` (optional filter: completed, failed)

**Response:**
```json
{
  "success": true,
  "total": 42,
  "limit": 20,
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

Get global statistics.

**Response:**
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

Generate Word/PDF report.

**Request:**
```json
{
  "analysis_sys_id": "xyz789..."
}
```

**Response:**
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
    "issues": [...],
    "recommendations": [...]
  }
}
```

---

## 💻 Development

### Built-in Rule Handlers (29+)

The `FHARuleEvaluator` includes 29+ built-in handlers for common patterns:

**Core Handlers:**
- `count_threshold` - Check if count exceeds threshold
- `inactive` - Detect inactive records
- `missing_field` - Check for required empty fields
- `duplicate` - Detect duplicate records
- `hardcoded_sys_id` - Find hardcoded sys_ids in scripts
- `pattern_scan` - Regex pattern matching
- `field_check` - Conditional field validation
- `aggregate_metric` - Calculate aggregate metrics

**Specialized Handlers:**
- `br_density` - Business rule density check
- `br_heavy` - Heavy business rules detection
- `system_created` - Records created by 'system'
- `missing_acl` - Missing ACL detection
- `acl_issue` - ACL configuration issues
- `job_error` - Scheduled job errors
- `flow_error` - Flow execution errors
- And 14 more...

### Adding Custom Handlers

**1. Edit FHARuleEvaluator Script Include**

```javascript
// In _handlers object, add:
my_custom_check: function(item, rule, params, context) {
    var issues = [];
    
    // Your logic here
    if (someCondition) {
        issues.push(this._issue(rule, 
            'Custom issue detected', 
            {
                record_table: item.table,
                record_sys_id: item.sys_id,
                record_name: item.values.name || 'Unnamed'
            }
        ));
    }
    
    return issues;
}
```

**2. Create Issue Rule**

```
Name: My Custom Check
Code: MY_CUSTOM_CHECK
Type: my_custom_check
Severity: medium
Params: '{"threshold": 10}'
Active: true
```

### Extending the Application

**Add New Verification Item**

1. Navigate to `x_1310794_founda_0_verification_items.list`
2. Create new record
3. Configure query and rules
4. Add to configuration

**Add New Widget**

1. Create Service Portal widget
2. Use pattern from existing FHA widgets
3. Add to FHA portal page

**Add New REST Endpoint**

1. Edit `sys_ws_definition_8add5d0883d2321083e1b4a6feaad355.xml`
2. Create new operation
3. Implement logic

---

## 🐛 Troubleshooting

### Common Issues

#### "Configuration not found"

**Cause:** Configuration sys_id is invalid or inactive.

**Solution:**
```javascript
// Verify configuration exists and is active
var gr = new GlideRecord('x_1310794_founda_0_configurations');
gr.addQuery('sys_id', 'YOUR_SYS_ID');
gr.addQuery('active', true);
gr.query();
if (!gr.hasNext()) {
    gs.info('Configuration not found or inactive');
}
```

#### "Analysis returns empty results"

**Cause:** Old analyses may not have `details` field populated.

**Solution:** Run a new analysis. The widget reads from the `details` JSON field.

#### "Slow analysis (>5 minutes)"

**Cause:** Deep scan on large tables or too many verification items.

**Solution:**
- Disable `deep_scan` for initial runs
- Set `include_children_tables=false`
- Limit verification items
- Add query filters to verification items

#### "REST API returns 403 Forbidden"

**Cause:** Missing required roles.

**Solution:**
```javascript
// Check user roles
var user = gs.getUser();
gs.info('Has admin role: ' + user.hasRole('x_1310794_founda_0.admin'));
gs.info('Has user role: ' + user.hasRole('x_1310794_founda_0.user'));
```

#### "Widget shows 'undefined' or errors"

**Cause:** Corrupted or missing data in results JSON.

**Solution:**
```javascript
// Validate results JSON structure
var gr = new GlideRecord('x_1310794_founda_0_results');
if (gr.get('SYS_ID_HERE')) {
    try {
        var details = JSON.parse(gr.getValue('details'));
        gs.info('Valid JSON: ' + JSON.stringify(details, null, 2));
    } catch (e) {
        gs.error('Invalid JSON: ' + e.message);
    }
}
```

### Debug Mode

Enable debug logging:

```javascript
// In FHAnalyzer or FHAnalysisEngine, add:
gs.log('DEBUG: ' + message, 'FHAnalyzer');
```

View logs in `System Logs > Application Logs`

### Performance Optimization

**For Large Instances:**

1. **Limit Verification Items**
   - Only add necessary verification items
   - Use specific encoded queries

2. **Use Pagination**
   - Add `setLimit()` in query scripts
   - Process in batches

3. **Cache Results**
   - Store frequently used data
   - Reduce redundant queries

4. **Schedule Off-Hours**
   - Run analyses during low-traffic periods
   - Use scheduled jobs for automation

---

## 📚 Additional Resources

### Documentation

- **Portal Documentation**: Navigate to `/fha?id=fha_documentation`
- **Technical Documentation**: See `docs/` folder
- **Handler Reference**: See `docs/handlers/` for detailed handler documentation

### Key Files

```
Foundation-Health-Analyzer/
├── README.md                                    (This file)
├── d852994c8312321083e1b4a6feaad3e6/
│   └── update/                                  (All ServiceNow XML files)
│       ├── sys_script_include_*.xml             (Script Includes)
│       ├── sys_ws_operation_*.xml               (REST API Operations)
│       ├── sp_widget_*.xml                      (Service Portal Widgets)
│       └── sys_ui_*.xml                         (UI Configuration)
└── docs/                                        (Documentation)
    ├── CONSOLIDATED_DOCUMENTATION.md            (Complete documentation - 50+ pages)
    ├── START_HERE.md                            (Quick start guide)
    ├── OBSOLETE_COMPONENTS_CLEANUP.md           (Cleanup guide)
    └── handlers/                                (Handler documentation)
        ├── HANDLERS_REFERENCE.md                (All 29 handlers documented)
        └── SCRIPTS_LIBRARY.md                   (Ready-to-use scripts)
```

### Support

- **Project Owner**: Wilfried Waret
- **Version**: 1.3.0
- **Last Updated**: January 17, 2026
- **ServiceNow Scope**: `x_1310794_founda_0`

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Report Issues**: Create detailed issue reports
2. **Suggest Features**: Submit feature requests
3. **Submit Pull Requests**: Follow coding standards
4. **Improve Documentation**: Help enhance docs

### Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/foundation-health-analyzer.git

# Import to ServiceNow instance
# Use Source Control integration or Update Sets

# Test changes
# Create test configurations and run analyses
```

### Coding Standards

- Use JSDoc comments for all functions
- Follow ServiceNow best practices
- Write clear, descriptive variable names
- Add error handling for all operations
- Test on multiple ServiceNow versions

---

## 📄 License

**Proprietary License** - All rights reserved

Copyright (c) 2026 Wilfried Waret

This application is proprietary software. Unauthorized copying, modification, or distribution is prohibited.

---

## 🙏 Acknowledgments

- **Development**: AI-assisted development with Claude (Anthropic)
- **Project Owner**: Wilfried Waret
- **ServiceNow Community**: For feedback and testing

---

## 📅 Version History

### v1.3.0 (2026-01-17)
- ✅ Consolidated documentation (README.md + 50-page comprehensive guide)
- ✅ Simplified architecture (3 active Script Includes)
- ✅ Enhanced rule system (29+ built-in handlers)
- ✅ Improved Service Portal widgets
- ✅ Complete REST API documentation
- ✅ Troubleshooting guide

### v1.2.0 (2026-01-10)
- Added FHARuleEvaluator with 29 handlers
- Migrated from check system to rule-based system
- Improved performance and scalability

### v1.1.0 (2026-01-04)
- Configuration options (deep_scan, include_children_tables, analyze_references)
- Deep scan script quality analysis
- Children tables analysis
- Integration dependencies mapping

### v1.0.0 (2026-01-03)
- Initial release
- Basic table analysis
- Service Portal integration
- REST API endpoints

---

## 🎯 Roadmap

### Planned Features

- [ ] **Machine Learning Integration**: Predict issues before they occur
- [ ] **Automated Remediation**: Auto-fix common issues
- [ ] **Advanced Reporting**: Customizable report templates
- [ ] **Scheduled Analysis**: Automated periodic health checks
- [ ] **Email Notifications**: Alert on critical issues
- [ ] **Dashboard Metrics**: Real-time health tracking
- [ ] **Integration with ITSM**: Link issues to change requests
- [ ] **Multi-Instance Support**: Compare health across instances

---

**Ready to analyze your ServiceNow tables? Get started at** `/fha` 🚀
