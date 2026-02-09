# 🎯 Target Table Pattern - Configuration-Centric Architecture

## 🎯 Concept Clé

**La Configuration définit la TABLE CIBLE à analyser.**
**Les Templates analysent les ÉLÉMENTS de cette table (BR, CS, ACL, etc.)**

---

## 📊 Architecture Correcte

### Cas d'Usage : Analyser les Business Rules de la Table Users

```
Configuration "Users Health Check"
├── table = sys_user  ← TABLE CIBLE À ANALYSER
├── template = "Business Rules Check"
└── options (deep_scan, filters, etc.)

    ↓ createFromTemplate()

Verification Item
├── table = sys_script  ← Où chercher (BR)
├── query_value = "collection=sys_user^active=true"  ← {0} remplacé !
└── issue_rules = [BR_HEAVY, HARDCODED_SYSID, ...]

    ↓ Analysis

Results:
- Business Rule #1 on sys_user: HARDCODED_SYSID detected
- Business Rule #2 on sys_user: BR_HEAVY (150 lines)
- etc.
```

**Analyse uniquement les BR de la table sys_user** ✅

---

## 🔄 Le Pattern {0}

### Dans les Templates

```javascript
// Template "Business Rules Check"
{
  table: 'sys_script',
  base_query: 'collection={0}^active=true^sys_packageISNOTEMPTY'
                         ↑
                    Placeholder
}
```

### Lors de createFromTemplate()

```javascript
// Configuration target table: sys_user
query = 'collection={0}^active=true^sys_packageISNOTEMPTY'
query = query.replace(/{0}/g, 'sys_user')
→ 'collection=sys_user^active=true^sys_packageISNOTEMPTY'
```

### Résultat

La Verification Item est créée avec la query **spécifique à la table cible** !

---

## 📋 Types de Templates

### Type 1 : Table-Specific Templates (Use {0})

**Analysent des ÉLÉMENTS d'une table spécifique**

| Template | Analyzes | Query Pattern | Use {0} |
|----------|----------|---------------|---------|
| Business Rules Check | sys_script | `collection={0}` | ✅ Yes |
| Client Scripts Check | sys_script_client | `table={0}` | ✅ Yes |
| UI Actions Check | sys_ui_action | `table={0}` | ✅ Yes |
| Security ACLs Check | sys_security_acl | `name={0}` | ✅ Yes |
| Table Records Check | {0} (dynamic) | `active=true` | ✅ Yes (table itself) |

**Example**:
```javascript
// Config: table = sys_user, template = "Business Rules Check"
// → Analyzes: BR on sys_user table only
```

### Type 2 : Instance-Wide Templates (No {0})

**Analysent TOUS les éléments (pas liés à une table spécifique)**

| Template | Analyzes | Query Pattern | Use {0} |
|----------|----------|---------------|---------|
| Scheduled Jobs | sysauto_script | `active=true` | ❌ No |
| Script Includes | sys_script_include | `active=true` | ❌ No |
| Email Notifications | sysevent_email_action | `active=true` | ❌ No |
| REST Messages | sys_rest_message | `active=true` | ❌ No |
| Portal Widgets | sp_widget | `active=true` | ❌ No |

**Example**:
```javascript
// Config: template = "Scheduled Jobs Analysis"
// → Analyzes: ALL scheduled jobs (instance-wide)
```

---

## 🎯 Exemples d'Utilisation

### Exemple 1 : Analyser BR sur Table User

```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();

// Get template
var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
template.get('name', 'Business Rules Check');

// Get target table
var targetTable = new GlideRecord('sys_db_object');
targetTable.get('name', 'sys_user');

// Create config
var config = new GlideRecord('x_1310794_founda_0_configurations');
config.initialize();
config.name = 'Users Table - BR Analysis';
config.table = targetTable.sys_id;
config.template = template.sys_id;
config.use_template = true;
config.ignore_servicenow_records = true;
config.active = true;

var configId = config.insert();

// Template Manager creates VI with query:
// "collection=sys_user^active=true^sys_packageISNOTEMPTY"

// Now you can run analysis
var analyzer = new x_1310794_founda_0.FHAnalyzer();
var result = analyzer.runAnalysis(configId);

gs.info('Analyzed BR on sys_user table');
gs.info('Issues: ' + result.details.issues.length);
```

**Résultat** : Uniquement les BR de la table sys_user ✅

---

### Exemple 2 : Analyser CS sur Table Incident

```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();

var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
template.get('name', 'Client Scripts Check');

var targetTable = new GlideRecord('sys_db_object');
targetTable.get('name', 'incident');

var configId = mgr.createFromTemplate(
    template.sys_id.toString(),
    'Incident Table - CS Analysis'
);

// Update target table
var config = new GlideRecord('x_1310794_founda_0_configurations');
config.get(configId);
config.table = targetTable.sys_id;
config.update();

// Re-create VI with correct query
// (or handle in createFromTemplate - see below)
```

---

## 🔧 Amélioration Nécessaire

### Le createFromTemplate() Doit Accepter target_table

Actuellement, le template définit la table. Mais pour votre cas d'usage :

**Configuration doit spécifier** :
- `table` = Table CIBLE (ex: sys_user)
- `template` = Template à appliquer (ex: "Business Rules Check")

**Solution** : Modifier la signature :

```javascript
createFromTemplate: function(templateId, configName, targetTable, options)
```

---

## 🛠️ Script Amélioré pour Votre Cas d'Usage

Créons une version qui supporte votre workflow :

```javascript
// Create config for specific table with template
var mgr = new x_1310794_founda_0.FHTemplateManager();

var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
template.get('name', 'Business Rules Check');

var targetTable = new GlideRecord('sys_db_object');
targetTable.get('name', 'sys_user');

var configId = mgr.createFromTemplate(
    template.sys_id.toString(),
    'Users - BR Analysis',
    targetTable.sys_id.toString(),  ← NEW PARAMETER
    {
        ignore_servicenow_records: true,
        deep_scan: false
    }
);

// Result: Config analyzes BR on sys_user table only
```

---

## ✅ Résumé

**Votre Vision** :
```
Configuration = Base
├── Définit la table cible (ex: sys_user)
├── Choisit un template (ex: BR Check)
└── Configure les options
```

**Les Templates** :
```
Template = Réutilisable
├── Définit QUOI analyser (BR, CS, ACL)
├── Avec quelles RÈGLES (HARDCODED_SYSID, etc.)
└── Query avec {0} = remplacé par table cible
```

**Résultat** :
- ✅ Même template pour toutes les tables
- ✅ Analyse focalisée (uniquement la table voulue)
- ✅ Pas de "trop de données"
- ✅ Réutilisabilité maximale

---

## 🚀 Prochaine Action

Je vais mettre à jour `FHTemplateManager_v2.js` pour accepter le paramètre `targetTable` et correctement gérer ce cas d'usage.

**Dois-je continuer avec cette amélioration ?** 🎯
