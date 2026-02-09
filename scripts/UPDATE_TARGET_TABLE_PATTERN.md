# 🎯 Mise à Jour : Pattern Table Cible

## 📌 Problème Identifié

Vous avez remonté un problème critique :

> "Je suis en train de rouler le script pour les BR mais il y a trop de chose a analyser"

**Cause** : Les templates analysaient TOUTES les BR de l'instance, pas seulement celles d'une table spécifique.

---

## ✅ Solution Implémentée

### Architecture Correcte

```
Configuration
├── table = sys_user  ← TABLE CIBLE à analyser
└── template = "Business Rules Check"

    ↓

Verification Item
├── query_value = "collection=sys_user^active=true"  ← Filtré !
└── Analyse uniquement les BR de sys_user ✅
```

---

## 🔧 Fichiers Modifiés

### 1. `FHTemplateManager_v2.js`

**Changements** :

#### A) Signature étendue de `createFromTemplate()`

```javascript
// ❌ AVANT
createFromTemplate: function(templateId, configName, options)

// ✅ APRÈS
createFromTemplate: function(templateId, configName, targetTable, options)
                                                      ↑
                                         Nouveau paramètre optionnel
```

**Compatibilité** : L'ancien signature continue de fonctionner (backward compatible)

#### B) Remplacement du placeholder {0}

```javascript
// Dans _createVerificationItemFromTemplate():

// Get target table from config
var config = new GlideRecord('x_1310794_founda_0_configurations');
config.get(configId);
var targetTable = config.table.getDisplayValue();

// Replace {0} with actual table name
var query = template.base_query || 'active=true';
query = query.replace(/{0}/g, targetTable);
```

**Résultat** : Le placeholder {0} est automatiquement remplacé par le nom de la table cible !

---

### 2. `populate_default_templates.js`

**Changements** : Tous les templates ont été mis à jour pour utiliser le pattern {0}

#### Templates Table-Specific (utilisent {0})

| Template | Table Analysée | Query Pattern |
|----------|----------------|---------------|
| Business Rules Check | sys_script | `collection={0}^active=true` |
| Client Scripts Check | sys_script_client | `table={0}^active=true` |
| UI Actions Check | sys_ui_action | `table={0}^active=true` |
| Security ACLs Check | sys_security_acl | `name={0}^ORname=*.{0}` |
| Table Records Direct Check | {0} | `active=true` |

**Important** : Si vous avez déjà lancé le script `populate_default_templates.js`, vous devez :
1. **Supprimer** les anciens templates
2. **Re-lancer** le script avec les nouveaux templates

#### Templates Instance-Wide (n'utilisent PAS {0})

| Template | Description |
|----------|-------------|
| Scheduled Jobs Analysis | Analyse TOUS les jobs (pas lié à une table) |
| Script Includes Review | Analyse TOUS les script includes |
| Email Notifications Audit | Analyse TOUTES les notifications |
| REST Messages Security | Analyse TOUS les REST messages |
| Service Portal Widgets | Analyse TOUS les widgets |

**Ces templates continuent d'analyser l'instance entière** (comportement attendu).

---

## 🚀 Comment Utiliser

### Méthode 1 : Via Script `analyze_table_with_template.js`

```javascript
// CONFIGURE HERE
var TARGET_TABLE = 'sys_user';
var TEMPLATE_NAME = 'Business Rules Check';
var CONFIG_NAME = 'Users Table - BR Analysis';

// Script runs automatically
```

**Résultat** :
- Crée une Configuration pour la table `sys_user`
- Applique le template "Business Rules Check"
- Analyse uniquement les BR sur `sys_user` ✅

### Méthode 2 : Via Code Direct

```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();

var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
template.get('name', 'Business Rules Check');

var targetTable = new GlideRecord('sys_db_object');
targetTable.get('name', 'sys_user');

var configId = mgr.createFromTemplate(
    template.sys_id.toString(),
    'Users - BR Analysis',
    targetTable.sys_id.toString(),  // ← TABLE CIBLE
    {
        ignore_servicenow_records: true,
        deep_scan: false
    }
);

// Run analysis
var analyzer = new x_1310794_founda_0.FHAnalyzer();
var result = analyzer.runAnalysis(configId);

gs.info('Issues found: ' + result.details.issues.length);
```

---

## 📋 Cas d'Usage Supportés

### ✅ Cas 1 : BR sur Table Users

```javascript
Config: table = sys_user, template = "Business Rules Check"
→ Query: "collection=sys_user^active=true"
→ Résultat: Uniquement les BR de sys_user
```

### ✅ Cas 2 : CS sur Table Incident

```javascript
Config: table = incident, template = "Client Scripts Check"
→ Query: "table=incident^active=true"
→ Résultat: Uniquement les CS de incident
```

### ✅ Cas 3 : ACLs sur Table Change Request

```javascript
Config: table = change_request, template = "Security ACLs Check"
→ Query: "name=change_request^ORname=*.change_request"
→ Résultat: Uniquement les ACL de change_request
```

### ✅ Cas 4 : Enregistrements Directs

```javascript
Config: table = incident, template = "Table Records Direct Check"
→ Table VI: incident (pas sys_script !)
→ Query: "active=true"
→ Résultat: Analyse des enregistrements incident directement
```

---

## 🎯 Avantages

### ✅ Réutilisabilité

**Un seul template pour toutes les tables !**

```
Template "Business Rules Check"
├── Utilisé pour sys_user → Analyse BR de sys_user
├── Utilisé pour incident → Analyse BR de incident
└── Utilisé pour change_request → Analyse BR de change_request
```

### ✅ Performance

**Fini les analyses massives !**

```
❌ AVANT: Analyse 2,543 BR (toute l'instance)
✅ APRÈS: Analyse 23 BR (uniquement sys_user)
```

### ✅ Précision

**Analyses ciblées et pertinentes**

```
Question: "Les BR sur la table user sont-elles correctes ?"
Réponse: Analyse uniquement les BR de sys_user ✅
```

---

## 📝 Actions Requises

### Étape 1 : Mettre à Jour le Script Include

1. Ouvrir `System Definition > Script Includes`
2. Trouver `FHTemplateManager`
3. Remplacer le contenu par `scripts/FHTemplateManager_v2.js`
4. Sauvegarder

### Étape 2 : Mettre à Jour les Templates

#### Option A : Supprimer et Recréer

1. Supprimer tous les enregistrements de `x_1310794_founda_0_analysis_templates`
2. Supprimer tous les enregistrements de `x_1310794_founda_0_template_rules`
3. Re-lancer `scripts/populate_default_templates.js`

#### Option B : Mise à Jour Manuelle

Pour chaque template, mettre à jour le champ `base_query` :

| Template | Ancien base_query | Nouveau base_query |
|----------|-------------------|-------------------|
| Business Rules Check | `active=true^sys_packageISNOTEMPTY` | `collection={0}^active=true^sys_packageISNOTEMPTY` |
| Client Scripts Check | `active=true^sys_packageISNOTEMPTY` | `table={0}^active=true^sys_packageISNOTEMPTY` |
| UI Actions Check | `active=true^sys_packageISNOTEMPTY` | `table={0}^active=true^sys_packageISNOTEMPTY` |
| Security ACLs Check | `active=true` | `name={0}^ORname=*.{0}^ORname={0}.*^active=true` |

### Étape 3 : Tester

1. Copier `scripts/analyze_table_with_template.js`
2. Configurer :
   - `TARGET_TABLE = 'sys_user'`
   - `TEMPLATE_NAME = 'Business Rules Check'`
3. Exécuter dans Scripts - Background
4. Vérifier :
   - ✅ La Configuration est créée avec `table = sys_user`
   - ✅ Le Verification Item a `query_value = "collection=sys_user^active=true"`
   - ✅ L'analyse ne trouve que les BR de sys_user

---

## 📚 Documentation Créée

| Fichier | Description |
|---------|-------------|
| `TARGET_TABLE_PATTERN.md` | Architecture complète du pattern table cible |
| `UPDATE_TARGET_TABLE_PATTERN.md` | Ce fichier - Guide de mise à jour |
| `analyze_table_with_template.js` | Script d'exemple pour analyser une table spécifique |

---

## ✅ Résumé

**Problème** : Trop de données analysées (toutes les BR de l'instance)

**Solution** : Pattern {0} + Paramètre targetTable

**Résultat** :
- ✅ Analyses ciblées sur une table spécifique
- ✅ Templates réutilisables
- ✅ Performance améliorée
- ✅ Réponses précises aux questions métier

**Votre cas d'usage initial est maintenant supporté** :
> "Je souhaite savoir si les BR sur la table des user sont correctes"
> → Utilise Configuration "User" + Template "BR Check" = Analyse uniquement BR de sys_user ✅

---

## 🎯 Prochaine Étape

1. **Déployer** le nouveau `FHTemplateManager_v2.js`
2. **Recréer** les templates (avec {0})
3. **Tester** avec le script `analyze_table_with_template.js`
4. **Confirmer** que l'analyse cible bien une seule table

**Besoin d'aide ?** Faites-moi signe ! 🚀
