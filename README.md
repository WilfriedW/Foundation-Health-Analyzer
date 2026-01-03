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

## ⚙️ Configuration Options

Les options de configuration permettent d'activer des analyses supplémentaires. Ces champs doivent être ajoutés à la table `fha_configuration` :

### Options disponibles

| Option | Type | Description |
|--------|------|-------------|
| `deep_scan` | Boolean | Analyse approfondie du contenu des scripts |
| `include_children_tables` | Boolean | Inclure les tables enfants dans l'analyse |
| `analyze_references` | Boolean | Analyser les champs de référence en détail |

---

### 🔵 Analyse de base (toujours exécutée)

Ces vérifications s'exécutent **toujours**, même si aucune option n'est activée :

#### FHCheckTable (base)
- ✅ Vérifie si la table existe
- ✅ Compte les enregistrements
- ✅ Liste les champs personnalisés avec taux de remplissage
- ✅ Liste les champs de référence
- ✅ Liste les Business Rules (actives/inactives)
- ✅ Liste les Client Scripts

#### FHCheckAutomation (base)
- ✅ Scheduled Jobs qui référencent la table
- ✅ Flows (table + tables parentes)
- ✅ Workflows (table + tables parentes)
- ✅ Notifications (table + tables parentes)
- ✅ UI Actions (table + tables parentes)
- ✅ UI Policies (table + tables parentes)

#### FHCheckIntegration (base)
- ✅ Data Sources ciblant la table
- ✅ Import Sets
- ✅ Transform Maps
- ✅ ACLs (table + tables parentes)
- ✅ REST APIs référençant la table

---

### 🟢 Deep Scan (`deep_scan = true`)

Active l'analyse du **contenu des scripts** pour détecter les problèmes de qualité :

#### FHCheckTable - Analyse des scripts
| Code | Sévérité | Description |
|------|----------|-------------|
| `CURRENT_UPDATE` | 🔴 High | Business Rule utilise `current.update()` (risque de récursion) |
| `HARDCODED_SYSID` | 🟡 Medium | Script contient des sys_id hardcodés |
| `EVAL_USAGE` | 🔴 High | Script utilise `eval()` (risque de sécurité) |
| `CONSOLE_LOG` | 🟢 Low | Script utilise `console.log` au lieu de `gs.log` |
| `SYNC_AJAX` | 🟡 Medium | Client Script utilise `getXMLWait()` (synchrone) |
| `QUERY_NO_LIMIT` | 🟡 Medium | GlideRecord en boucle sans `setLimit()` |

#### FHCheckAutomation - Analyse des automations
| Code | Sévérité | Description |
|------|----------|-------------|
| `NO_DESCRIPTION` | 🟢 Low | Flow sans description |
| `GS_SLEEP` | 🟡 Medium | Script utilise `gs.sleep()` |
| `HARDCODED_SYSID` | 🟡 Medium | Script contient des sys_id hardcodés |
| `EVAL_USAGE` | 🔴 High | Script utilise `eval()` |

#### FHCheckIntegration - Analyse des transform maps
| Code | Sévérité | Description |
|------|----------|-------------|
| `HARDCODED_SYSID` | 🟡 Medium | Transform map contient des sys_id hardcodés |
| `UNCONDITIONAL_IGNORE` | 🟢 Low | `ignore()` sans condition |
| `NO_ERROR_HANDLING` | 🟢 Low | GlideRecord sans try-catch |

---

### 🟣 Include Children Tables (`include_children_tables = true`)

Active l'analyse des **tables enfants** (tables qui étendent la table analysée) :

#### FHCheckTable - Tables enfants
- Liste toutes les tables qui héritent de la table analysée
- Compte les enregistrements de chaque table enfant
- Identifie le scope de chaque table

**Métriques ajoutées :**
```json
{
  "children_tables": [
    { "name": "incident", "label": "Incident", "record_count": 5000 },
    { "name": "problem", "label": "Problem", "record_count": 200 }
  ],
  "children_table_count": 2
}
```

#### FHCheckAutomation - Automations des enfants
- Inclut les Flows/Workflows/Notifications des tables enfants
- Fusion avec la hiérarchie parente

#### FHCheckIntegration - Intégrations des enfants
- Inclut les Data Sources/Transform Maps des tables enfants
- Inclut les REST APIs des tables enfants

---

### 🟠 Analyze References (`analyze_references = true`)

Active l'analyse **approfondie des champs de référence** :

#### FHCheckTable - Qualité des références
| Code | Sévérité | Description |
|------|----------|-------------|
| `ORPHAN_REFERENCES` | 🟡 Medium | Références vers des enregistrements supprimés |

**Métriques ajoutées :**
```json
{
  "reference_analysis": [
    {
      "field": "assigned_to",
      "reference_table": "sys_user",
      "null_count": 150,
      "null_percentage": 15,
      "orphan_count": 3,
      "orphan_detected": true
    }
  ]
}
```

#### FHCheckIntegration - Dépendances d'intégration
- Cartographie les intégrations **entrantes** (Data Sources, Transform Maps)
- Cartographie les intégrations **sortantes** (REST APIs, REST Messages)

**Métriques ajoutées :**
```json
{
  "integration_dependencies": {
    "inbound": [
      { "type": "Data Source", "name": "LDAP Import", "active": true },
      { "type": "Transform Map", "name": "User Transform", "active": true }
    ],
    "outbound": [
      { "type": "REST API", "name": "User API", "method": "GET", "active": true }
    ]
  },
  "inbound_integration_count": 2,
  "outbound_integration_count": 1
}
```

---

## 🔍 Analysis Checks (Détail)

### FHCheckTable

Analyzes table-specific elements:

- **Custom Fields**: Lists all custom fields with fill rates
- **Business Rules**: Active/inactive BR count, identifies issues
- **Client Scripts**: Active/inactive CS count
- **Reference Fields**: Lists reference fields and validates targets

**Issues Detected:**
| Code | Sévérité | Description |
|------|----------|-------------|
| `INVALID_CONFIG` | 🔴 High | Configuration invalide (pas de table) |
| `TABLE_NOT_FOUND` | 🔴 High | Table n'existe pas |
| `EMPTY_TABLE` | 🟡 Medium | Table sans enregistrements |
| `LARGE_TABLE` | 🟡 Medium | Table avec >1M enregistrements |
| `UNUSED_FIELD` | 🔴 High | Champ personnalisé jamais rempli (0%) |
| `LOW_USAGE_FIELD` | 🟡 Medium | Champ personnalisé peu utilisé (<10%) |
| `POTENTIAL_DUPLICATE` | 🟡 Medium | Champ u_xxx qui duplique un champ OOTB |
| `TOO_MANY_CUSTOM_FIELDS` | 🟡 Medium | Plus de 50 champs personnalisés |
| `INVALID_REFERENCE` | 🔴 High | Référence vers table inexistante |
| `MANY_BUSINESS_RULES` | 🟡 Medium | Plus de 20 BR actives |
| `INACTIVE_BUSINESS_RULES` | 🟢 Low | Plus de 10 BR inactives |
| `MANY_CLIENT_SCRIPTS` | 🟡 Medium | Plus de 15 CS actifs |
| `MANY_CHILD_TABLES` | 🟢 Low | Plus de 10 tables enfants |

### FHCheckAutomation

Analyzes automation elements:

- **Scheduled Jobs**: Jobs related to the table
- **Flows**: Flow Designer flows (table + parents)
- **Workflows**: Legacy workflows (table + parents)
- **Notifications**: Email notifications (table + parents)
- **UI Actions**: UI Actions (table + parents)
- **UI Policies**: UI Policies (table + parents)

**Issues Detected:**
| Code | Sévérité | Description |
|------|----------|-------------|
| `INACTIVE_SCHEDULED_JOB` | 🟢 Low | Scheduled job inactif |
| `INACTIVE_FLOW` | 🟢 Low | Flow inactif |
| `MANY_FLOWS` | 🟡 Medium | Plus de 10 flows |
| `UNPUBLISHED_WORKFLOW` | 🟡 Medium | Workflow actif mais non publié |
| `LEGACY_WORKFLOWS` | 🟢 Low | Table utilise des workflows legacy |
| `MANY_NOTIFICATIONS` | 🟡 Medium | Plus de 20 notifications |
| `MANY_UI_ACTIONS` | 🟡 Medium | Plus de 25 UI Actions |
| `MANY_UI_POLICIES` | 🟡 Medium | Plus de 15 UI Policies |

### FHCheckIntegration

Analyzes integration elements:

- **Data Sources**: Import data sources
- **Import Sets**: Import set runs and failures
- **Transform Maps**: Data transformation maps
- **ACLs**: Security configuration (table + parents)
- **REST APIs**: Scripted REST APIs referencing the table

**Issues Detected:**
| Code | Sévérité | Description |
|------|----------|-------------|
| `INACTIVE_DATA_SOURCE` | 🟢 Low | Data source inactive |
| `FAILED_IMPORTS` | 🟡 Medium | Imports échoués dans les 30 derniers jours |
| `INACTIVE_TRANSFORM_MAP` | 🟢 Low | Transform map inactive |
| `NO_READ_ACL` | 🟡 Medium | Pas d'ACL de lecture |
| `NO_WRITE_ACL` | 🟡 Medium | Pas d'ACL d'écriture |
| `MANY_INTEGRATIONS` | 🟢 Low | Plus de 10 intégrations |

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

### Authentication
All endpoints require authentication and appropriate roles (`x_1310794_founda_0.admin` or `x_1310794_founda_0.user`).

---

### 📋 GET /tables

Get all available table configurations for analysis.

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
      "description": "Analysis configuration for incident table"
    }
  ]
}
```

---

### 🔬 POST /analyze/{table_name}

Run health analysis on a table by its name. Requires an active configuration for the table.

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

**Response (404):**
```json
{
  "success": false,
  "error": "No active configuration found for table: my_table"
}
```

---

### 🔬 GET /analyze_by_config/{config_sys_id}

Run health analysis using a specific configuration sys_id.

**Request:**
```http
GET /api/x_1310794_founda_0/fha/analyze_by_config/abc123def456
Authorization: Basic <credentials>
```

**Response (200):**
```json
{
  "success": true,
  "status": "COMPLETED",
  "analysis_id": "xyz789...",
  "result_sys_id": "xyz789...",
  "config_sys_id": "abc123def456",
  "table_name": "incident",
  "health_score": 75,
  "issues_found": 8,
  "duration": 3,
  "message": "Analysis completed successfully",
  "timestamp": "2026-01-03 10:30:00"
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Configuration not found: abc123def456",
  "statusCode": 404,
  "timestamp": "2026-01-03 10:30:00"
}
```

---

### 📊 GET /analysis/{analysis_id}

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
    "created_on": "2026-01-03 10:30:00",
    "issues": [
      {
        "code": "EMPTY_FIELD",
        "message": "Custom field 'u_custom' has 0% fill rate",
        "severity": "medium",
        "category": "field"
      }
    ],
    "metrics": {
      "custom_field_count": 15,
      "active_br_count": 8,
      "inactive_br_count": 3
    }
  }
}
```

---

### 📈 GET /statistics

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
    },
    "recent_analyses": [
      {
        "sys_id": "abc123...",
        "number": "FHAR0001042",
        "table_name": "Incident",
        "health_score": 85,
        "issues_count": 5,
        "created_on": "2026-01-03 10:30:00"
      }
    ]
  }
}
```

---

### 📜 GET /history

Get paginated history of all analyses with optional filters.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | Integer | 20 | Number of records (max: 100) |
| `offset` | Integer | 0 | Pagination offset |
| `table_name` | String | - | Filter by table name |
| `status` | String | - | Filter by status (completed, failed) |

**Request:**
```http
GET /api/x_1310794_founda_0/fha/history?limit=10&offset=0&status=completed
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
      "created_on": "2026-01-03 10:30:00",
      "created_by": "admin"
    }
  ]
}
```

---

### 🔍 GET /fields

Get custom fields for a table with fill rate statistics.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `table_name` | String | Yes | The table name to analyze |

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
  "table_label": "Incident",
  "count": 5,
  "fields": [
    {
      "name": "u_custom_field",
      "label": "Custom Field",
      "type": "string",
      "fill_rate": 85,
      "filled_records": 850,
      "total_records": 1000,
      "sys_id": "abc123..."
    }
  ]
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Table not found: my_table"
}
```

---

### 📄 POST /report/word

Generate a structured report for Word/PDF export from an analysis result.

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
      "table_label": "Incident",
      "analysis_date": "2026-01-03 10:30:00",
      "generated_on": "2026-01-03 11:00:00",
      "generated_by": "System Administrator"
    },
    "summary": {
      "health_score": 75,
      "issues_count": 12,
      "status": "completed"
    },
    "issues": [...],
    "metrics": {...},
    "recommendations": [
      {
        "category": "Fields",
        "priority": "medium",
        "description": "Review 5 field issue(s) - consider removing unused custom fields"
      },
      {
        "category": "Business Rules",
        "priority": "high",
        "description": "Review 3 business rule issue(s) - inactive rules may need cleanup"
      }
    ]
  }
}
```

---

### Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Missing required parameters |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

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

### v1.1.0 (2026-01-04)
- **New**: Configuration options (`deep_scan`, `include_children_tables`, `analyze_references`)
- **New**: Deep scan - Script quality analysis (current.update, hardcoded sys_ids, eval)
- **New**: Children tables analysis with record counts
- **New**: Reference field quality analysis (orphan detection)
- **New**: Integration dependencies mapping (inbound/outbound)
- **Improved**: Table hierarchy support (parents + children)
- **Improved**: Detailed documentation of all options

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

