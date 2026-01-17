# 🏗️ Structure Complète de l'Application FHA
**Version** : 1.3.0 | **Date** : 17 janvier 2026

---

## 📊 Vue d'Ensemble

```
Foundation Health Analyzer (FHA)
├── 3 Script Includes (ACTIFS)
├── 4 Tables Custom
├── 8 REST API Endpoints
├── 4 Service Portal Widgets
├── 3 Service Portal Pages
└── 50+ Documents de Documentation
```

---

## 🔧 Script Includes (Composants Principaux)

### ✅ ACTIFS (À conserver)

#### 1. FHAnalyzer
**Fichier** : `sys_script_include_f27265808316321083e1b4a6feaad33d.xml`  
**Rôle** : Point d'entrée principal  
**Lignes** : ~200  
**API Name** : `x_1310794_founda_0.FHAnalyzer`

**Méthodes clés** :
```javascript
runAnalysis(configSysId)           // Lance une analyse
getConfiguration(configSysId)       // Charge une config
_saveResult(config, result)         // Sauvegarde résultat
```

**Utilisation** :
```javascript
var analyzer = new x_1310794_founda_0.FHAnalyzer();
var result = analyzer.runAnalysis("CONFIG_SYS_ID");
```

---

#### 2. FHAnalysisEngine
**Fichier** : `sys_script_include_033a4751531a3610c7233ee0a0490e0f.xml`  
**Rôle** : Orchestrateur de vérification  
**Lignes** : ~400  
**API Name** : `x_1310794_founda_0.FHAnalysisEngine`

**Méthodes clés** :
```javascript
runVerification(config)             // Exécute vérifications
_executeQuery(item)                 // Exécute requête
_analyzeResults(result)             // Applique règles
_loadIssueRules(items)              // Charge règles
```

**Flow** :
```
1. Load verification items from config
2. For each item:
   a. Execute query (encoded or script)
   b. Load issue rules
   c. Apply rules via FHARuleEvaluator
3. Aggregate issues
4. Return result
```

---

#### 3. FHARuleEvaluator
**Fichier** : `sys_script_include_cccafeed53163610c7233ee0a0490abc.xml`  
**Rôle** : Évaluateur de règles avec 29 handlers  
**Lignes** : ~800  
**API Name** : `x_1310794_founda_0.FHARuleEvaluator`

**Méthodes clés** :
```javascript
evaluate(item, rules, context)      // Évalue toutes les règles
_runScript(script, ...)             // Exécute script custom
_issue(rule, message, details)      // Crée une issue
```

**29 Handlers Built-in** :
```javascript
// CORE (11 handlers - Génériques)
count_threshold      // Vérifie nombre > seuil
br_density          // Vérifie BR > seuil
inactive            // Détecte records inactifs
system_created      // Détecte creation par 'system'
missing_field       // Vérifie champs requis vides
size_threshold      // Vérifie taille > max
duplicate           // Détecte doublons
hardcoded_sys_id    // Détecte sys_id hardcodés
field_check         // Vérifie condition sur champ
pattern_scan        // Cherche pattern regex
aggregate_metric    // Calcul métrique agrégée

// LEGACY (18 handlers - À migrer vers scripts)
missing_acl         // Vérifie ACL manquante
acl_issue          // Vérifie problème ACL
br_heavy           // BR trop lourd
cs_heavy           // CS trop lourd
ui_action          // UI Action issue
job_error          // Job erreur
job_inactive       // Job inactif
flow_error         // Flow erreur
flow_config        // Flow config
... (9 autres)
```

---

### ❌ INACTIFS (À supprimer)

Les 9 Script Includes suivants sont marqués `<active>false</active>` et remplacés par le système v2.0 :

1. **FHCheckTable** - Remplacé par FHARuleEvaluator + verification items
2. **FHCheckAutomation** - Idem
3. **FHCheckIntegration** - Idem
4. **FHCheckSecurity** - Idem
5. **FHCheckRegistry** - Non utilisé
6. **FHAnalysisContext** - Non utilisé
7. **FHOptionsHandler** - Non utilisé
8. **FHScanUtils** - Non utilisé
9. **FHAUtils** - Non utilisé

**Action recommandée** : Suivre `OBSOLETE_COMPONENTS_CLEANUP.md`

---

## 🗄️ Tables Custom

### 1. x_1310794_founda_0_configurations
**Label** : Configurations  
**Type** : collection  
**Extends** : (base table)

**Champs** :
| Champ | Type | Description |
|-------|------|-------------|
| `name` | string | Nom de la configuration |
| `table` | reference (sys_db_object) | Table à analyser |
| `active` | boolean | Configuration active |
| `verification_items` | glide_list | Liste des verification items |
| `deep_scan` | boolean | Analyse approfondie |
| `include_children_tables` | boolean | Inclure tables enfants |
| `include_ldap` | boolean | Inclure LDAP |
| `ignore_servicenow_records` | boolean | Ignorer records OOB |

**Indexes** :
- `sys_class_name`
- `table`

---

### 2. x_1310794_founda_0_verification_items
**Label** : Verification Items  
**Type** : collection  
**Extends** : `x_1310794_founda_0_configurations`

**Champs** :
| Champ | Type | Description |
|-------|------|-------------|
| `name` | string | Nom du verification item |
| `category` | choice | Catégorie (automation, integration, security, UI) |
| `table` | reference (sys_db_object) | Table à requêter |
| `query_type` | choice | Type de requête (encoded, script) |
| `query_value` | string | Requête encodée |
| `query_script` | script | Script de requête custom |
| `fields` | string | Champs à récupérer (CSV) |
| `issue_rules` | glide_list | Liste des règles à appliquer |
| `metadata` | string (JSON) | Métadonnées custom |
| `active` | boolean | Item actif |

**Choix `category`** :
- automation
- integration
- security
- UI

**Choix `query_type`** :
- encoded : requête encodée ServiceNow
- script : script JavaScript custom

---

### 3. x_1310794_founda_0_issue_rules
**Label** : Issue Rules  
**Type** : collection

**Champs** :
| Champ | Type | Description |
|-------|------|-------------|
| `name` | string | Nom de la règle |
| `code` | string | Code unique (ex: BR_TOO_MANY) |
| `type` | string | Type de handler (ex: br_density) |
| `severity` | string | Sévérité (high, medium, low) |
| `params` | string (JSON) | Paramètres du handler |
| `script` | script | Script custom JavaScript |
| `description` | string | Description de la règle |
| `active` | boolean | Règle active |

**Exemple de règle** :
```json
{
  "name": "Too many Business Rules",
  "code": "BR_TOO_MANY",
  "type": "br_density",
  "severity": "medium",
  "params": "{\"threshold\": 30}",
  "script": "",
  "active": true
}
```

---

### 4. x_1310794_founda_0_results
**Label** : Results  
**Type** : collection

**Champs** :
| Champ | Type | Description |
|-------|------|-------------|
| `number` | string | Numéro auto (FHAR0001XXX) |
| `state` | choice | État (In Progress, Completed, Error) |
| `table_name` | reference (sys_db_object) | Table analysée |
| `health_score` | integer | Score de santé (0-100) |
| `issue_found` | integer | Nombre d'issues trouvées |
| `configuration` | reference | Configuration utilisée |
| `details` | string (JSON) | Détails complets en JSON |

**Structure du champ `details`** :
```json
{
  "config": {
    "sys_id": "...",
    "name": "...",
    "table_name": "incident",
    "verification_items": [...]
  },
  "issues": [
    {
      "code": "BR_TOO_MANY",
      "message": "Too many BRs...",
      "severity": "medium",
      "details": {...}
    }
  ],
  "categories": {
    "automation": [...],
    "integration": [...],
    "security": [...]
  },
  "execution_metadata": {
    "start_time": "...",
    "end_time": "...",
    "duration": 5
  }
}
```

---

## 🌐 REST API Endpoints

**Base URL** : `https://<instance>.service-now.com/api/x_1310794_founda_0/fha`

### 1. GET /tables
**Fichier** : `sys_ws_operation_f950a58c83d2321083e1b4a6feaad3c1.xml`  
**Description** : Liste toutes les configurations disponibles  
**Auth** : Required (Basic Auth)  
**Roles** : `x_1310794_founda_0.admin` ou `.user`

**Response** :
```json
{
  "success": true,
  "count": 3,
  "tables": [
    {
      "config_sys_id": "abc123...",
      "display_name": "Incident Analysis",
      "table_name": "incident",
      "table_label": "Incident"
    }
  ]
}
```

---

### 2. POST /analyze/{table_name}
**Fichier** : `sys_ws_operation_793161008316321083e1b4a6feaad360.xml`  
**Description** : Lance analyse par nom de table  
**Auth** : Required  
**Roles** : `x_1310794_founda_0.admin`

**Request** :
```json
{
  "deep_scan": true,
  "include_children": false
}
```

**Response** :
```json
{
  "success": true,
  "analysis_id": "xyz789...",
  "health_score": 75,
  "issues_count": 12
}
```

---

### 3. POST /analyze_by_config/{config_sys_id}
**Fichier** : `sys_ws_operation_dfecb14883d6321083e1b4a6feaad35b.xml`  
**Description** : Lance analyse par configuration  
**Auth** : Required  
**Roles** : `x_1310794_founda_0.admin`

---

### 4. GET /analysis/{analysis_id}
**Fichier** : `sys_ws_operation_877169008316321083e1b4a6feaad3d8.xml`  
**Description** : Récupère résultat d'analyse  
**Auth** : Required  
**Roles** : `x_1310794_founda_0.user`

---

### 5. GET /fields?table_name={table}
**Fichier** : `sys_ws_operation_5f8fbbc483d6721083e1b4a6feaad309.xml`  
**Description** : Liste champs custom avec fill rate  
**Auth** : Required  
**Roles** : `x_1310794_founda_0.user`

---

### 6. GET /history
**Fichier** : `sys_ws_operation_db15adc48316321083e1b4a6feaad3f7.xml`  
**Description** : Historique des analyses  
**Auth** : Required  
**Roles** : `x_1310794_founda_0.user`  
**Params** : `limit`, `offset`, `table_name`, `status`

---

### 7. GET /statistics
**Fichier** : `sys_ws_operation_e9352d088316321083e1b4a6feaad345.xml`  
**Description** : Statistiques globales  
**Auth** : Required  
**Roles** : `x_1310794_founda_0.user`

---

### 8. POST /report/word
**Fichier** : `sys_ws_operation_acb121408316321083e1b4a6feaad36c.xml`  
**Description** : Génère rapport Word/PDF  
**Auth** : Required  
**Roles** : `x_1310794_founda_0.user`

---

## 🎨 Service Portal Widgets

### 1. FHA Dashboard
**ID** : `fha_dashboard`  
**Fichier** : `sp_widget_223611488392321083e1b4a6feaad3db.xml`  
**Lignes** : ~1,380  
**Utilisé par** : Page `fha_homepage`

**Fonctionnalités** :
- Dropdown de sélection de configuration
- Bouton "Run Analysis"
- Liste des analyses récentes
- Loading states
- Redirection vers résultats

**Client Controller** :
```javascript
$scope.runAnalysis = function() {
  // Appelle server script runAnalysis
  // Redirige vers page de résultats
};

$scope.loadRecentAnalyses = function() {
  // Charge dernières analyses
};
```

---

### 2. FHA Analysis Detail
**ID** : `fha_analysis_detail`  
**Fichier** : `sp_widget_3ee88bd48312f21083e1b4a6feaad39a.xml`  
**Lignes** : ~927  
**Utilisé par** : Page `fha_analysis_results`

**Fonctionnalités** :
- Tabs (Overview, Issues, JSON)
- Filtrage par severity
- Filtrage par type (automation, integration, etc.)
- Search
- Sort
- Export JSON
- Badges colorés par severity

**Client Controller** :
```javascript
$scope.setTab = function(tab) {
  // Change active tab
};

$scope.filterBySeverity = function(severity) {
  // Filtre issues
};

$scope.exportJSON = function() {
  // Télécharge JSON
};
```

---

### 3. FHA Documentation
**ID** : `fha-documentation`  
**Fichier** : `sp_widget_5ada939c8392f21083e1b4a6feaad360.xml`  
**Lignes** : ~1,084  
**Utilisé par** : Page `fha_documentation`

**Fonctionnalités** :
- 10 sections de documentation
- Scroll-spy navigation
- Navigation sticky
- Smooth scroll
- IntersectionObserver pour active section
- Liens vers documentation externe

**Sections** :
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

### 4. FHA Analysis Results (LEGACY)
**ID** : `fha_analysis_results`  
**Fichier** : `sp_widget_9f5755c88392321083e1b4a6feaad3de.xml`  
**Lignes** : ~300  
**Status** : ⚠️ Legacy - À remplacer par FHA Analysis Detail

---

## 📄 Service Portal Pages

### 1. FHA Homepage
**ID** : `fha_homepage`  
**Fichier** : `sp_page_9c28514c8392321083e1b4a6feaad34a.xml`  
**URL** : `/fha` ou `/fha?id=fha_homepage`  
**Widgets** : FHA Dashboard

---

### 2. FHA Documentation
**ID** : `fha_documentation`  
**Fichier** : `sp_page_277a975c8392f21083e1b4a6feaad318.xml`  
**URL** : `/fha?id=fha_documentation`  
**Widgets** : FHA Documentation

---

### 3. FHA Analysis Results
**ID** : `fha_analysis_results`  
**Fichier** : `sp_page_5ac0e61483dab21083e1b4a6feaad3b5.xml`  
**URL** : `/fha?id=fha_analysis_results&sys_id=RESULT_SYS_ID`  
**Widgets** : FHA Analysis Detail

---

## 📚 Documentation

### Documents Principaux
```
docs/
├── START_HERE.md                    ⭐ Point d'entrée (300 lignes)
├── CONSOLIDATED_DOCUMENTATION.md     📚 Doc complète (1,275 lignes / 50+ pages)
├── README.md                         📖 Overview technique (900 lignes)
├── CHANGELOG.md                      📝 Historique versions
│
├── OBSOLETE_COMPONENTS_CLEANUP.md    🧹 Guide nettoyage (457 lignes)
├── WIDGET_UPDATE_INSTRUCTIONS.md     🔧 Mise à jour widget (450 lignes)
├── DOCUMENTATION_OVERHAUL_SUMMARY.md 📊 Résumé travaux (700 lignes)
├── RESUME_TRAVAUX_2026-01-17.md      🇫🇷 Résumé français (420 lignes)
│
├── ANALYSE_COMPLETE_2026-01-17.md    📊 Cette analyse (créée aujourd'hui)
├── SYNTHESE_PLAN_ACTION.md           🎯 Plan action (créé aujourd'hui)
└── STRUCTURE_APPLICATION.md          🏗️ Ce document
```

### Guides Spécialisés
```
docs/handlers/
├── HANDLERS_REFERENCE.md             📖 29 handlers documentés (579 lignes)
├── ARCHITECTURE.md                   🏗️ Architecture handlers (490 lignes)
├── QUICK_REFERENCE.md                ⚡ Cheat sheet
├── SCRIPTS_LIBRARY.md                📚 Scripts réutilisables
├── README.md                         📄 Overview handlers
└── aggregate-handlers.md             🔢 Pattern agrégation
```

---

## 🔄 Workflow Complet d'une Analyse

### 1. Utilisateur Lance Analyse

```
User Dashboard (/fha)
    ↓
Sélectionne Configuration "Demo_Incident_Basic"
    ↓
Clique "Run Analysis"
    ↓
Widget appelle server script runAnalysis(configSysId)
```

---

### 2. FHAnalyzer Traite

```javascript
// FHAnalyzer.runAnalysis(configSysId)

1. getConfiguration(configSysId)
   ├── Load config from x_1310794_founda_0_configurations
   ├── Load verification_items (glide_list)
   └── Return config object

2. new FHAnalysisEngine().runVerification(config)
   ├── For each verification_item:
   │   ├── Execute query (encoded or script)
   │   ├── Load issue_rules (glide_list)
   │   ├── For each record:
   │   │   └── FHARuleEvaluator.evaluate(item, rules, context)
   │   │       ├── Run custom script (if present)
   │   │       └── Run handler (if present)
   │   └── Collect issues
   └── Return result with all issues

3. _saveResult(config, result)
   ├── Create record in x_1310794_founda_0_results
   ├── Set state = "Completed"
   ├── Store full details as JSON in 'details' field
   └── Return result_sys_id

4. Return to widget
   └── analysis_id: result_sys_id
```

---

### 3. Widget Affiche Résultat

```
Widget reçoit analysis_id
    ↓
Redirige vers /fha?id=fha_analysis_results&sys_id=ANALYSIS_ID
    ↓
Widget FHA Analysis Detail charge
    ↓
Server script getData(sys_id)
    ├── Load from x_1310794_founda_0_results
    ├── Parse 'details' JSON field
    └── Return to client
    ↓
Client affiche:
    ├── Tab Overview (health score, summary)
    ├── Tab Issues (liste filtrable)
    └── Tab JSON (export)
```

---

## 📊 Métriques de l'Application

### Code Stats
| Composant | Nombre | Lignes | % Total |
|-----------|--------|--------|---------|
| Script Includes (actifs) | 3 | ~1,500 | 50% |
| Script Includes (inactifs) | 9 | ~2,500 | 29% |
| Widgets | 4 | ~3,400 | 39% |
| REST APIs | 8 | ~1,600 | 18% |
| Documentation | 20+ | ~12,000 | - |
| **TOTAL CODE** | | **~8,700** | 100% |

### Après Nettoyage
| Composant | Nombre | Lignes | % Total |
|-----------|--------|--------|---------|
| Script Includes | 3 | ~1,500 | 33% |
| Widgets | 3 | ~3,100 | 67% |
| REST APIs | 8 | ~1,600 | - |
| **TOTAL CODE** | | **~4,600** | **-47%** |

---

## 🎯 Dépendances

### Entre Composants

```
FHAnalyzer
    ↓ depends on
FHAnalysisEngine
    ↓ depends on
FHARuleEvaluator
    ↓ depends on
Issue Rules (table)
```

### Tables

```
Configurations (parent)
    ↓ has many
Verification Items (child - extends parent)
    ↓ has many
Issue Rules (referenced via glide_list)
    ↓ produces
Results
```

### Widgets → Pages

```
fha_dashboard → fha_homepage
fha_analysis_detail → fha_analysis_results
fha-documentation → fha_documentation
```

---

## 🔍 Points d'Extension

### 1. Ajouter un Nouveau Handler
**Fichier** : `sys_script_include_cccafeed53163610c7233ee0a0490abc.xml`  
**Location** : FHARuleEvaluator._handlers

```javascript
my_custom_handler: function(item, rule, params, context) {
    var issues = [];
    
    // Votre logique ici
    if (condition) {
        issues.push(this._issue(rule, message, details));
    }
    
    return issues;
}
```

---

### 2. Créer une Règle Custom
**Table** : `x_1310794_founda_0_issue_rules`

```javascript
// Dans le champ 'script' de la règle
var issues = [];

if (item.values.active === 'false') {
    issues.push({
        code: rule.code,
        message: 'Record inactive',
        severity: 'low',
        details: {
            record_table: item.table,
            record_sys_id: item.sys_id
        }
    });
}

return issues;
```

---

### 3. Créer un Verification Item Custom
**Table** : `x_1310794_founda_0_verification_items`

**Option A - Encoded Query** :
```
query_type: encoded
query_value: active=true^ORDERBYDESCsys_created_on
fields: name,active,script,collection
```

**Option B - Script Query** :
```javascript
// query_type: script
// query_script:
var gr = new GlideRecord('sys_script');
gr.addQuery('active', true);
gr.addQuery('collection', config.table_name);
gr.query();
return gr;
```

---

### 4. Créer un Widget Custom
**Location** : Service Portal > Widgets

**Utiliser le pattern** :
```html
<!-- HTML Template -->
<div ng-if="data.ready">
    <h2>{{data.title}}</h2>
    <!-- Votre contenu -->
</div>

<!-- Client Script -->
function($scope, spUtil) {
    var c = this;
    
    c.loadData = function() {
        c.server.get({
            sys_id: c.options.sys_id
        }).then(function(response) {
            c.data = response.data;
        });
    };
    
    c.loadData();
}

<!-- Server Script -->
(function() {
    data.title = "My Custom Widget";
    data.ready = true;
})();
```

---

## 🚀 Quick Commands

### Lancer Analyse (Script Background)
```javascript
var analyzer = new x_1310794_founda_0.FHAnalyzer();
var configSysId = "VOTRE_CONFIG_SYS_ID";
var result = analyzer.runAnalysis(configSysId);
gs.info("Analysis ID: " + result.analysis_id);
gs.info("Health Score: " + result.details.health_score);
```

### Tester un Handler (Script Background)
```javascript
var evaluator = new x_1310794_founda_0.FHARuleEvaluator();
var item = {
    sys_id: "123",
    table: "sys_script",
    values: {
        name: "My BR",
        active: "false"
    }
};
var rule = {
    code: "INACTIVE",
    type: "inactive",
    severity: "low"
};
var issues = evaluator.evaluate(item, [rule], {});
gs.info("Issues found: " + issues.length);
```

### Lister Toutes les Configs (Script Background)
```javascript
var gr = new GlideRecord('x_1310794_founda_0_configurations');
gr.addQuery('active', true);
gr.query();
while (gr.next()) {
    gs.info(gr.name + " (" + gr.table.name + ")");
}
```

---

## 📞 Support & Ressources

### Documentation
- **Primaire** : CONSOLIDATED_DOCUMENTATION.md
- **Quick Start** : START_HERE.md
- **API** : Section REST API Reference
- **Handlers** : docs/handlers/HANDLERS_REFERENCE.md

### Guides
- **Cleanup** : OBSOLETE_COMPONENTS_CLEANUP.md
- **Widget Update** : WIDGET_UPDATE_INSTRUCTIONS.md
- **Migration** : MIGRATION_GUIDE_v2.md

### URLs Utiles
- Dashboard : `/fha`
- Documentation : `/fha?id=fha_documentation`
- Results : `/fha?id=fha_analysis_results&sys_id=SYS_ID`

---

**Créé par** : Claude (Expert ServiceNow)  
**Date** : 17 janvier 2026  
**Version** : 1.0  
**Basé sur** : FHA v1.3.0
