# Guide de Migration des Handlers

> **Migration de l'architecture hardcodée vers l'architecture externalisée (data-driven)**

---

## 📋 Vue d'ensemble

### Avant (Architecture hardcodée)

```
┌─────────────────────────┐
│  FHARuleEvaluator       │
│                         │
│  _handlers: {           │
│    inactive: fn(),      │  ← 29 handlers hardcodés
│    system_created: fn(),│     dans le code
│    count_threshold: fn(),
│    ...                  │
│  }                      │
└─────────────────────────┘
           │
           ↓
      Exécution des handlers
```

**Problèmes** :
- ❌ 634 lignes de code dans FHARuleEvaluator
- ❌ Modification = redéploiement du Script Include
- ❌ Difficile à maintenir et étendre
- ❌ Pas de versioning des handlers
- ❌ Tests complexes

### Après (Architecture externalisée)

```
┌─────────────────────────┐
│  FHARuleEvaluator       │
│                         │
│  evaluate(item, rules)  │  ← Script Include léger (130 lignes)
│    ├─ _runScript()      │     Lit et exécute les scripts
│    └─ helpers           │     depuis la table
└─────────────────────────┘
           │
           ↓
┌─────────────────────────┐
│  x_1310794_founda_0_    │
│  issue_rules (table)    │
│                         │
│  Rule 1:                │  ← Toutes les règles et scripts
│    code: INACTIVE       │     dans la table
│    script: "..."        │
│                         │
│  Rule 2:                │
│    code: SYSTEM_CREATED │
│    script: "..."        │
│  ...                    │
└─────────────────────────┘
```

**Avantages** :
- ✅ Script Include simplifié (130 lignes)
- ✅ Modification = update dans la table
- ✅ Facile à maintenir et étendre
- ✅ Versioning automatique (sys_mod_count)
- ✅ Tests unitaires simplifiés
- ✅ Hot-reload sans redéploiement

---

## 🚀 Étapes de Migration

### Étape 1 : Sauvegarde

**⚠️ IMPORTANT** : Avant toute modification, créez une sauvegarde !

1. Exportez le Script Include actuel
2. Exportez toutes les règles de la table `x_1310794_founda_0_issue_rules`
3. Gardez une copie du dossier `update/`

```bash
# Créer un backup
cd /Users/wilfriedwaret/Dev/Projects/FHA/Foundation-Health-Analyzer
mkdir -p BACKUP_$(date +%Y%m%d)
cp d852994c8312321083e1b4a6feaad3e6/update/sys_script_include_cccafeed53163610c7233ee0a0490abc.xml BACKUP_$(date +%Y%m%d)/
cp d852994c8312321083e1b4a6feaad3e6/update/x_1310794_founda_0_issue_rules_*.xml BACKUP_$(date +%Y%m%d)/
```

---

### Étape 2 : Mettre à jour le Script Include

**Fichier** : `NEW_FHARuleEvaluator.xml`

#### Dans ServiceNow Studio

1. Ouvrez **Studio** → **Application** : `Foundation Health Analyzer`
2. Naviguez vers **Server Development** → **Script Includes**
3. Ouvrez `FHARuleEvaluator`
4. **Remplacez TOUT le contenu** par le contenu du fichier `NEW_FHARuleEvaluator.xml` (section `<script>`)
5. **Sauvegardez**

#### Via Git (Update Set)

1. Remplacez le fichier :
```bash
cp NEW_FHARuleEvaluator.xml d852994c8312321083e1b4a6feaad3e6/update/sys_script_include_cccafeed53163610c7233ee0a0490abc.xml
```

2. Commitez et pushez :
```bash
git add d852994c8312321083e1b4a6feaad3e6/update/sys_script_include_cccafeed53163610c7233ee0a0490abc.xml
git commit -m "refactor: Simplify FHARuleEvaluator - Externalize handlers to issue_rules table"
git push
```

3. Dans ServiceNow, importez l'Update Set depuis le repo Git

---

### Étape 3 : Mettre à jour les règles existantes

**Dossier** : `MIGRATED_RULES/`

Vous avez **3 règles existantes** à mettre à jour :

#### Option A : Via ServiceNow UI (Recommandé pour débuter)

Pour chaque règle :

1. Ouvrez **x_1310794_founda_0_issue_rules.list**
2. Trouvez la règle (par code)
3. Ouvrez-la
4. Dans le champ **Script**, copiez-collez le script depuis :
   - `MIGRATED_RULES/x_1310794_founda_0_issue_rules_inactive.xml` (section `<script>`)
   - `MIGRATED_RULES/x_1310794_founda_0_issue_rules_system_created.xml`
   - `MIGRATED_RULES/x_1310794_founda_0_issue_rules_many.xml`
5. **Sauvegardez**

#### Option B : Via XML Import

1. Copiez les fichiers du dossier `MIGRATED_RULES/` vers le dossier `update/` :
```bash
cp MIGRATED_RULES/*.xml d852994c8312321083e1b4a6feaad3e6/update/
```

2. Commitez et pushez :
```bash
git add d852994c8312321083e1b4a6feaad3e6/update/x_1310794_founda_0_issue_rules_*.xml
git commit -m "feat: Add scripts to existing issue rules for externalized handlers"
git push
```

3. Importez l'Update Set dans ServiceNow

---

### Étape 4 : Tester la migration

#### Test 1 : Vérifier les règles

```javascript
// Dans Scripts - Background
var gr = new GlideRecord('x_1310794_founda_0_issue_rules');
gr.addActiveQuery();
gr.query();

gs.info('=== ISSUE RULES WITH SCRIPTS ===');
while (gr.next()) {
    var hasScript = gr.getValue('script') && gr.getValue('script').trim() !== '';
    gs.info(gr.getValue('code') + ' [' + gr.getValue('type') + '] - Script: ' + (hasScript ? 'YES' : 'NO'));
}
```

**Résultat attendu** :
```
INACTIVE_RECORD [inactive] - Script: YES
SYSTEM_CREATED [system_created] - Script: YES
MANY_RECORDS [count_threshold] - Script: YES
```

#### Test 2 : Exécuter une analyse

1. Allez sur le **Portal FHA** : `/fha`
2. Sélectionnez une configuration de test (ex: une table avec peu de records)
3. Lancez l'analyse
4. Vérifiez que les issues sont détectées correctement

#### Test 3 : Test unitaire (Scripts - Background)

```javascript
// Test manuel de l'évaluateur
var evaluator = new x_1310794_founda_0.FHARuleEvaluator();

// Mock item (inactive record)
var item = {
    sys_id: 'test123',
    table: 'incident',
    category: 'task',
    values: {
        name: 'Test Record',
        active: 'false'
    }
};

// Mock rule (inactive rule with script)
var rule = {
    code: 'INACTIVE_RECORD',
    name: 'Inactive record',
    severity: 'high',
    active: true,
    params: '{}',
    script: "var activeVal = (item.values.active || '').toString().toLowerCase();\n" +
            "if (activeVal === 'false') {\n" +
            "    var recordName = item.values.name || item.values.title || 'Record';\n" +
            "    var message = 'Inactive record: \"' + recordName + '\". Consider activating or removing.';\n" +
            "    issues.push(issue(rule, message, {\n" +
            "        field: 'active',\n" +
            "        expected: 'true',\n" +
            "        actual: 'false',\n" +
            "        record_table: item.table,\n" +
            "        record_sys_id: item.sys_id,\n" +
            "        record_name: recordName\n" +
            "    }));\n" +
            "}"
};

// Execute
var context = { totalCount: 1 };
var issues = evaluator.evaluate(item, [rule], context);

gs.info('=== TEST RESULT ===');
gs.info('Issues found: ' + issues.length);
if (issues.length > 0) {
    gs.info('Issue code: ' + issues[0].code);
    gs.info('Issue message: ' + issues[0].message);
    gs.info('Issue severity: ' + issues[0].severity);
}
```

**Résultat attendu** :
```
Issues found: 1
Issue code: INACTIVE_RECORD
Issue message: Inactive record: "Test Record". Consider activating or removing.
Issue severity: high
```

---

### Étape 5 : Créer de nouvelles règles (si besoin)

Si vous avez besoin de **26 autres règles** (pour un total de 29), utilisez le document `HANDLERS_MIGRATION_SCRIPTS.md` qui contient tous les scripts prêts à l'emploi.

#### Créer une nouvelle règle

1. Allez dans **x_1310794_founda_0_issue_rules**
2. Cliquez sur **New**
3. Remplissez :
   - **Name** : Nom descriptif
   - **Code** : CODE_UNIQUE (majuscules + underscores)
   - **Type** : Type du handler (ex: `missing_field`, `size_threshold`, etc.)
   - **Severity** : `high`, `medium`, ou `low`
   - **Description** : Description de la règle
   - **Params** : JSON (ex: `{"field": "description", "max_len": 2000}`)
   - **Script** : Copiez depuis `HANDLERS_MIGRATION_SCRIPTS.md`
   - **Active** : ☑️ Coché
4. **Submit**

---

## 📚 Référence Rapide

### Variables disponibles dans les scripts

| Variable  | Type     | Description                                       |
| --------- | -------- | ------------------------------------------------- |
| `item`    | Object   | Record analysé { sys_id, table, category, values }|
| `rule`    | Object   | Règle { code, name, severity, params, ... }       |
| `params`  | Object   | Paramètres parsés depuis rule.params (JSON)       |
| `context` | Object   | Contexte partagé { totalCount, _dupsSeen, ... }   |
| `issue()` | Function | Helper: `issue(rule, message, details)`           |
| `issues`  | Array    | Array à remplir avec les issues détectées         |

### Exemple de script simple

```javascript
// Vérifier si un champ est vide
if (!item.values.description || item.values.description === '') {
    var recordName = item.values.name || 'Record';
    var message = 'Missing description in "' + recordName + '"';
    
    issues.push(issue(rule, message, {
        field: 'description',
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: recordName
    }));
}
```

### Exemple de script agrégé

```javascript
// Compter sur tout le dataset (fire une seule fois)
if (!context) context = {};
if (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};
var key = 'my_rule_' + rule.code;

if (!context._aggregateIssuesFired[key]) {
    var total = context.totalCount || 0;
    var threshold = params.threshold || 100;
    
    if (total > threshold) {
        context._aggregateIssuesFired[key] = true;
        issues.push(issue(rule, 'Too many: ' + total, { count: total }));
    }
}
```

---

## 🔍 Troubleshooting

### Erreur : "Rule X has no script defined"

**Cause** : La règle n'a pas de script dans le champ `script`

**Solution** :
1. Ouvrez la règle dans la table
2. Copiez le script depuis `HANDLERS_MIGRATION_SCRIPTS.md`
3. Collez dans le champ **Script**
4. Sauvegardez

---

### Erreur : "Script execution error for rule X"

**Cause** : Erreur de syntaxe dans le script

**Solution** :
1. Consultez les logs système (System Log → All)
2. Recherchez l'erreur détaillée avec le stack trace
3. Corrigez la syntaxe dans le script
4. Testez avec Scripts - Background avant de sauvegarder

---

### Les issues ne sont plus détectées

**Vérifications** :

1. ✅ Le nouveau `FHARuleEvaluator` est bien déployé ?
2. ✅ Les règles ont des scripts dans le champ `script` ?
3. ✅ Les règles sont actives (`active = true`) ?
4. ✅ Les paramètres `params` sont valides (JSON) ?
5. ✅ Videz le cache : `cache.flush()` dans Scripts - Background

---

## 📊 Résultat de la Migration

### Métriques

| Métrique                  | Avant | Après | Gain       |
| ------------------------- | ----- | ----- | ---------- |
| Lignes FHARuleEvaluator   | 634   | 130   | **-79%**   |
| Handlers hardcodés        | 29    | 0     | **-100%**  |
| Modification handlers     | Code  | Table | **Facile** |
| Redéploiement requis      | Oui   | Non   | **Non**    |
| Versioning handlers       | Non   | Oui   | **Oui**    |
| Tests unitaires           | Hard  | Easy  | **Easy**   |

### Fichiers créés

1. ✅ `NEW_FHARuleEvaluator.xml` - Nouveau Script Include
2. ✅ `HANDLERS_MIGRATION_SCRIPTS.md` - Tous les 29 scripts
3. ✅ `MIGRATED_RULES/` - Fichiers XML des 3 règles existantes
4. ✅ `MIGRATION_HANDLERS_GUIDE.md` - Ce guide

---

## ✅ Checklist de Migration

- [ ] Sauvegarde effectuée
- [ ] FHARuleEvaluator mis à jour
- [ ] 3 règles existantes migrées (scripts ajoutés)
- [ ] Test 1 : Vérification des scripts ✅
- [ ] Test 2 : Analyse complète ✅
- [ ] Test 3 : Test unitaire ✅
- [ ] Documentation à jour
- [ ] Équipe informée

---

## 🎯 Prochaines Étapes

1. **Créer les 26 autres règles** (si nécessaire)
2. **Ajuster les scripts** selon vos besoins métier
3. **Créer de nouvelles règles personnalisées**
4. **Documenter vos règles spécifiques**

---

**Version:** 1.0  
**Date:** 2026-01-17  
**Auteur:** Wilfried Waret  
**Contact:** Foundation Health Analyzer Team
