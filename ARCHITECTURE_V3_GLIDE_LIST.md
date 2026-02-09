# 🎯 Architecture v3 : Multi Verification Items avec glide_list

## 📌 Votre Vision Implémentée

> "La table verification items pourrais etre des item comme - Business Rules Check ou client script check, ou notification check avec des issues rules specifique. Si dans ma configuration j'appelle le Template BR alors j'ai toute les verification items associé a ce template qui se lancent ou alors si j'ai besoin d'un niveau de detail plus fin, sur la configuration j'utilise le champs verification items en direct."

**✅ C'est exactement ce qui est implémenté !**

---

## 📊 Architecture Globale

### Concept : 3 Niveaux de Granularité

```
┌─────────────────────────────────────────────────────────┐
│ NIVEAU 1 : Verification Item Templates (Réutilisables) │
├─────────────────────────────────────────────────────────┤
│ VI Template "Business Rules Check"                     │
│ ├── table: sys_script                                  │
│ ├── query: "collection={0}^active=true"                │
│ ├── is_template: true                                  │
│ └── issue_rules: [BR_HEAVY, HARDCODED_SYSID, ...]      │
│                                                         │
│ VI Template "Client Scripts Check"                     │
│ ├── table: sys_script_client                           │
│ ├── query: "table={0}^active=true"                     │
│ ├── is_template: true                                  │
│ └── issue_rules: [CS_HEAVY, HARDCODED_SYSID]           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ NIVEAU 2 : Analysis Templates (Ensembles thématiques)  │
├─────────────────────────────────────────────────────────┤
│ Template "Complete Table Health Check"                 │
│ ├── verification_items: [glide_list]                   │
│ │   ├── Business Rules Check                           │
│ │   ├── Client Scripts Check                           │
│ │   ├── UI Actions Check                               │
│ │   └── Notifications Check                            │
│ └── table: {0}                                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ NIVEAU 3 : Configuration (Instance spécifique)         │
├─────────────────────────────────────────────────────────┤
│ Option A : Template Complet                            │
│ ├── table: sys_user                                    │
│ ├── template: "Complete Table Health Check"            │
│ ├── use_template: true                                 │
│ └── → Clone les 4 VI du template                       │
│                                                         │
│ Option B : Sélection Manuelle                          │
│ ├── table: sys_user                                    │
│ ├── verification_items: [Business Rules Check]         │
│ └── use_template: false                                │
│     → Utilise uniquement le VI sélectionné             │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Modèle de Données

### Pas de Nouvelle Table ! 🎉

**On utilise uniquement les tables existantes avec des champs supplémentaires.**

### Table 1 : `x_1310794_founda_0_verification_items`

**Nouveaux Champs** :
- `is_template` (boolean) : Indique si c'est un template réutilisable ou une instance
- `template_category` (string) : Catégorie pour organiser les templates

**Champs Existants** :
- `name` : Nom du VI
- `table` : Table à analyser (peut contenir `{0}`)
- `query_value` : Query encoded (peut contenir `{0}`)
- `issue_rules` : **glide_list** vers `issue_rules` (EXISTE DÉJÀ)
- `fields` : Champs à récupérer
- `active` : Actif ou non

**Utilisation** :
```javascript
// VI Template (réutilisable)
{
    name: 'Business Rules Check',
    is_template: true,
    table: 'sys_script',
    query_value: 'collection={0}^active=true',
    issue_rules: 'sys_id1,sys_id2,sys_id3'  // glide_list
}

// VI Instance (lié à une config)
{
    name: 'Business Rules Check - sys_user',
    is_template: false,
    table: 'sys_script',
    query_value: 'collection=sys_user^active=true',  // {0} remplacé
    issue_rules: 'sys_id1,sys_id2,sys_id3'  // Copié du template
}
```

---

### Table 2 : `x_1310794_founda_0_analysis_templates`

**Nouveau Champ** :
- `verification_items` : **glide_list** vers `verification_items` (NOUVEAU)

**Champs Existants** :
- `name` : Nom du template
- `description` : Description
- `table` : Table cible (peut être `{0}`)
- `category` : Catégorie
- `icon` : Icône
- `estimated_duration` : Durée estimée
- `active` : Actif ou non

**Utilisation** :
```javascript
Template "Complete Table Health Check"
{
    name: 'Complete Table Health Check',
    table: '{0}',
    verification_items: 'vi_sys_id1,vi_sys_id2,vi_sys_id3,vi_sys_id4'  // glide_list
}
```

---

### Table 3 : `x_1310794_founda_0_configurations`

**Aucun Changement !**

**Champs Existants** :
- `table` : Table cible
- `template` : Template utilisé (optionnel)
- `verification_items` : **glide_list** vers `verification_items` (EXISTE DÉJÀ)
- `use_template` : Utilise template ou sélection manuelle

**Utilisation** :
```javascript
// Option A : Template complet
{
    table: 'sys_user',
    template: 'Complete Table Health Check',
    use_template: true,
    verification_items: 'vi_inst1,vi_inst2,vi_inst3,vi_inst4'  // Créé automatiquement
}

// Option B : Sélection manuelle
{
    table: 'sys_user',
    verification_items: 'vi_inst1'  // Sélectionné manuellement
    use_template: false
}
```

---

## 🔄 Workflow Détaillé

### Cas 1 : Template Complet

```javascript
// 1. User action
var mgr = new x_1310794_founda_0.FHTemplateManager();
var configId = mgr.createFromTemplate(
    'template_sys_id',
    'Users - Complete Health',
    'sys_user',
    { ignore_servicenow_records: true }
);

// 2. System actions
// a. Lit template.verification_items (glide_list)
//    → ['vi_template_1', 'vi_template_2', 'vi_template_3']

// b. Pour chaque VI template :
//    - Clone le VI
//    - Remplace {0} par 'sys_user' dans query_value
//    - Remplace {0} par 'sys_user' dans table si nécessaire
//    - Copie issue_rules (glide_list)
//    - Marque is_template = false

// c. Crée la configuration
//    - Lie les VI clonés via verification_items (glide_list)
//    - Stocke le template source
//    - Marque use_template = true

// 3. Résultat
// Config avec 3 VI instances prêtes à analyser
```

---

### Cas 2 : Sélection Manuelle

```javascript
// 1. User action (manuelle dans UI)
// a. Crée configuration
var config = new GlideRecord('x_1310794_founda_0_configurations');
config.initialize();
config.name = 'Users - BR Only';
config.table = 'sys_user_sys_id';
config.use_template = false;

// b. Sélectionne VI template (via UI glide_list picker)
// ou clone manuellement
var mgr = new x_1310794_founda_0.FHTemplateManager();
var clonedVIId = mgr._cloneVI('vi_template_sys_id', 'sys_user');

config.verification_items = clonedVIId;
config.insert();

// 2. Résultat
// Config avec 1 seul VI instance
```

---

## 📋 VI Templates Disponibles

### Catégorie : Automation

| VI Template | Table Analysée | Règles | Description |
|-------------|----------------|--------|-------------|
| Business Rules Check | sys_script | BR_HEAVY, HARDCODED_SYSID, BR_DENSITY, MISSING_FIELD, SYSTEM_CREATED | Check complet des BR |
| Business Rules Performance | sys_script | BR_HEAVY, BR_DENSITY | Focus performance uniquement |
| Business Rules Security | sys_script | HARDCODED_SYSID, PATTERN_SCAN | Focus sécurité uniquement |

### Catégorie : Performance

| VI Template | Table Analysée | Règles | Description |
|-------------|----------------|--------|-------------|
| Client Scripts Check | sys_script_client | CS_HEAVY, HARDCODED_SYSID, MISSING_FIELD | Check complet des CS |

### Catégorie : Quality

| VI Template | Table Analysée | Règles | Description |
|-------------|----------------|--------|-------------|
| UI Actions Check | sys_ui_action | HARDCODED_SYSID, MISSING_FIELD, INACTIVE_RECORD | Check des UI Actions |
| Table Records Check | {0} | MISSING_FIELD, DUPLICATE, INACTIVE_RECORD | Check direct des enregistrements |

### Catégorie : Security

| VI Template | Table Analysée | Règles | Description |
|-------------|----------------|--------|-------------|
| Security ACLs Check | sys_security_acl | ACL_PERMISSIVE, HARDCODED_SYSID, MISSING_FIELD | Check des ACLs |

### Catégorie : Integration

| VI Template | Table Analysée | Règles | Description |
|-------------|----------------|--------|-------------|
| Notifications Check | sysevent_email_action | MISSING_FIELD, INACTIVE_RECORD, SYSTEM_CREATED | Check des notifications |

---

## 📋 Analysis Templates Disponibles

### Template : Complete Table Health Check

**Description** : Analyse complète de tous les aspects d'une table

**VI Inclus** :
- Business Rules Check
- Client Scripts Check
- UI Actions Check
- Security ACLs Check
- Notifications Check

**Durée estimée** : 120 min

**Cas d'usage** : Audit complet d'une table critique

---

### Template : Security Audit

**Description** : Focus sécurité uniquement

**VI Inclus** :
- Business Rules Security
- Security ACLs Check

**Durée estimée** : 60 min

**Cas d'usage** : Audit de sécurité avant mise en production

---

### Template : Performance Analysis

**Description** : Focus performance uniquement

**VI Inclus** :
- Business Rules Performance
- Client Scripts Check

**Durée estimée** : 45 min

**Cas d'usage** : Investigation de problèmes de performance

---

### Template : Business Rules Only

**Description** : Analyse complète des BR uniquement

**VI Inclus** :
- Business Rules Check

**Durée estimée** : 30 min

**Cas d'usage** : Audit rapide des BR d'une table

---

### Template : Quality Check

**Description** : Focus qualité et cohérence

**VI Inclus** :
- UI Actions Check
- Table Records Check

**Durée estimée** : 30 min

**Cas d'usage** : Vérification qualité des données

---

## 🎯 Exemples d'Utilisation

### Exemple 1 : Analyse Complète Table Users

```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();

var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
template.get('name', 'Complete Table Health Check');

var configId = mgr.createFromTemplate(
    template.sys_id.toString(),
    'Users - Complete Health Check',
    'sys_user',
    {
        ignore_servicenow_records: true,
        deep_scan: false
    }
);

// Résultat : 5 VI créés
// - Business Rules Check - sys_user
// - Client Scripts Check - sys_user
// - UI Actions Check - sys_user
// - Security ACLs Check - sys_user
// - Notifications Check - sys_user
```

---

### Exemple 2 : BR Uniquement sur Incident

```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();

var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
template.get('name', 'Business Rules Only');

var configId = mgr.createFromTemplate(
    template.sys_id.toString(),
    'Incident - BR Analysis',
    'incident',
    {
        ignore_servicenow_records: true
    }
);

// Résultat : 1 VI créé
// - Business Rules Check - incident
```

---

### Exemple 3 : Sélection Manuelle

```javascript
// Get VI template
var viTemplate = new GlideRecord('x_1310794_founda_0_verification_items');
viTemplate.addQuery('name', 'Business Rules Security');
viTemplate.addQuery('is_template', true);
viTemplate.query();
viTemplate.next();

// Clone VI manually
var mgr = new x_1310794_founda_0.FHTemplateManager();
var clonedVIId = mgr._cloneVI(viTemplate.sys_id.toString(), 'sys_user');

// Create config manually
var config = new GlideRecord('x_1310794_founda_0_configurations');
config.initialize();
config.name = 'Users - BR Security Only';

var targetTable = new GlideRecord('sys_db_object');
targetTable.get('name', 'sys_user');
config.table = targetTable.sys_id.toString();

config.verification_items = clonedVIId;
config.use_template = false;
config.active = true;

var configId = config.insert();

// Résultat : 1 VI créé (BR Security uniquement)
```

---

## ✅ Avantages de l'Architecture v3

### ✅ Pas de Nouvelle Table
- Utilise `glide_list` sur tables existantes
- Moins de complexité
- Modèle ServiceNow standard

### ✅ Granularité Maximale
- **Template complet** : Analyse complète en 1 clic
- **VI individuels** : Contrôle fin

### ✅ Réutilisabilité
- VI templates réutilisables pour toutes les tables
- Templates combinables

### ✅ Flexibilité
- Créer de nouveaux VI templates facilement
- Créer de nouveaux Analysis Templates en quelques clics
- Pas de code, juste des enregistrements

### ✅ Maintenance
- Mise à jour d'un VI template = toutes les futures configs bénéficient
- Pas de code dupliqué

---

## 📝 Déploiement

### Étape 1 : Ajouter les Champs

**Voir** : `scripts/table_updates_v3.xml`

1. Sur `x_1310794_founda_0_verification_items` :
   - Ajouter `is_template` (boolean)
   - Ajouter `template_category` (string)

2. Sur `x_1310794_founda_0_analysis_templates` :
   - Ajouter `verification_items` (glide_list → verification_items)

### Étape 2 : Déployer FHTemplateManager v3

1. Copier `scripts/FHTemplateManager_v3.js`
2. Mettre à jour le Script Include dans ServiceNow

### Étape 3 : Peupler les Templates

1. Copier `scripts/populate_templates_v3.js`
2. Exécuter dans Scripts - Background
3. Vérifier :
   - 8 VI Templates créés
   - 6 Analysis Templates créés

### Étape 4 : Tester

1. Copier `scripts/example_usage_v3.js`
2. Exécuter les exemples
3. Vérifier les résultats

---

## 🎯 Votre Cas d'Usage Initial

> "Je souhaites savoir si les BR sur la table des user sont correct. Exemple si je ne veux que les BR check sur sys user"

### Solution v3

**Option A : Template "Business Rules Only"**

```javascript
// Template donne 1 VI : Business Rules Check
var configId = mgr.createFromTemplate(
    'Business Rules Only',
    'Users - BR Analysis',
    'sys_user'
);
// → Analyse uniquement les BR de sys_user ✅
```

**Option B : Sélection Manuelle du VI**

```javascript
// Sélectionner manuellement "Business Rules Check" VI
// Résultat identique mais plus de contrôle
```

**Les deux options fonctionnent parfaitement !** 🎉

---

## 📚 Fichiers de Référence

| Fichier | Description |
|---------|-------------|
| `FHTemplateManager_v3.js` | Script Include v3 |
| `populate_templates_v3.js` | Script de population |
| `table_updates_v3.xml` | Définition des champs |
| `example_usage_v3.js` | Exemples d'utilisation |
| `ARCHITECTURE_V3_GLIDE_LIST.md` | Ce document |

---

## 🚀 Prochaine Étape

**Déployez l'architecture v3 !**

1. ✅ Lisez ce document
2. ☐ Ajoutez les champs (table_updates_v3.xml)
3. ☐ Déployez FHTemplateManager_v3.js
4. ☐ Peuplez les templates (populate_templates_v3.js)
5. ☐ Testez avec les exemples (example_usage_v3.js)

**Questions ?** Je suis là ! 🎯
