# Carte de Référence Rapide - Handlers

## 📋 Handlers CORE (à utiliser en priorité)

| Handler            | Type | Description                 | Params requis                   |
| ------------------ | ---- | --------------------------- | ------------------------------- |
| `count_threshold`  | AGG  | Compte total > seuil        | `threshold`                     |
| `br_density`       | AGG  | BR sur table > seuil        | `threshold`                     |
| `field_check`      | IND  | Vérifie condition sur champ | `field`, `operator`, `expected` |
| `pattern_scan`     | IND  | Cherche regex dans champs   | `fields`, `pattern`             |
| `inactive`         | IND  | Détecte records inactifs    | -                               |
| `system_created`   | IND  | Créé par 'system'           | -                               |
| `missing_field`    | IND  | Champs vides/manquants      | `fields`                        |
| `size_threshold`   | IND  | Champ trop long             | `field`, `max_len`              |
| `duplicate`        | IND  | Doublons sur clés           | `key_fields` (opt)              |
| `hardcoded_sys_id` | IND  | Sys_id en dur               | `fields` (opt)                  |
| `aggregate_metric` | AGG  | Métrique agrégée custom     | `metric`, `threshold`           |

_AGG = Agrégé (1 issue/dataset), IND = Individuel (1 issue/record)_

---

## 🔧 field_check - Opérateurs

| Opérateur      | Description     | Exemple                                   |
| -------------- | --------------- | ----------------------------------------- |
| `equals`       | Égalité exacte  | `"field": "active", "expected": "false"`  |
| `not_equals`   | Différent de    | `"field": "status", "expected": "draft"`  |
| `contains`     | Contient texte  | `"field": "script", "expected": "eval("`  |
| `not_contains` | Ne contient pas | `"field": "name", "expected": "test"`     |
| `empty`        | Vide ou null    | `"field": "description", "expected": ""`  |
| `not_empty`    | Non vide        | `"field": "priority", "expected": ""`     |
| `regex`        | Match regex     | `"field": "email", "expected": "^[a-z]+"` |
| `gt`           | Plus grand que  | `"field": "order", "expected": "100"`     |
| `lt`           | Plus petit que  | `"field": "priority", "expected": "5"`    |
| `gte`          | >=              | `"field": "count", "expected": "10"`      |
| `lte`          | <=              | `"field": "timeout", "expected": "30"`    |

---

## 📝 Template de Script Personnalisé

### Script basique (individuel)

```javascript
if (condition) {
  issues.push({
    code: rule.code,
    message: "Description claire du problème",
    severity: rule.severity || "medium",
    details: {
      record_table: item.table,
      record_sys_id: item.sys_id,
      record_name: item.values.name,
      recommendation: "Action à prendre",
    },
  });
}
```

### Script agrégé (1 issue pour tout le dataset)

```javascript
// Évite les duplicatas
if (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};
var key = "my_check_" + rule.code;
if (!context._aggregateIssuesFired[key]) {
  var count = context.totalCount || 0;
  if (count > threshold) {
    context._aggregateIssuesFired[key] = true;
    issues.push({
      code: rule.code,
      message: "Issue agrégée: " + count + " records",
      severity: "medium",
      details: { count: count },
    });
  }
}
```

---

## 🎯 Exemples Rapides

### Détecter eval() dans scripts

```json
{
  "type": "pattern_scan",
  "params": "{\"fields\": \"script\", \"pattern\": \"eval\\\\(\"}"
}
```

### Vérifier timeout > 60s

```json
{
  "type": "field_check",
  "params": "{\"field\": \"timeout\", \"operator\": \"gt\", \"expected\": \"60\"}"
}
```

### Trop de BR (agrégé)

```json
{
  "type": "br_density",
  "params": "{\"threshold\": 30}"
}
```

### Champ description vide

```json
{
  "type": "missing_field",
  "params": "{\"fields\": \"description\"}"
}
```

### Script BR > 2000 caractères

```json
{
  "type": "size_threshold",
  "params": "{\"field\": \"script\", \"max_len\": 2000}"
}
```

---

## 🔍 Variables Disponibles dans Scripts

```javascript
// item - L'enregistrement analysé
item.sys_id; // Sys ID
item.table; // Table source
item.category; // Catégorie (automation, security, etc.)
item.values; // Objet avec tous les champs
item.values.name; // Nom du record
item.values.active; // Actif (string 'true'/'false')
item.values.script; // Script (si applicable)

// rule - La règle en cours
rule.code; // Code de la règle (ex: 'BR_HEAVY')
rule.severity; // Sévérité (low/medium/high)
rule.params; // Paramètres (déjà parsés en objet)

// params - Alias de rule.params
params.threshold; // Exemple de param
params.field; // Exemple de param

// context - Contexte partagé
context.totalCount; // Nombre total de records
context._dupsSeen; // Map des doublons détectés
context._aggregateIssuesFired; // Map des issues agrégées déjà déclenchées

// issues - Tableau à remplir
issues.push({ code, message, severity, details });
```

---

## 📦 Détails d'une Issue (Structure)

```javascript
{
    // Requis
    code: 'ISSUE_CODE',              // Code unique
    message: 'Message descriptif',   // Message clair
    severity: 'medium',              // low/medium/high

    // Recommandé
    details: {
        // Liens directs
        record_table: 'sys_script',      // Table du record
        record_sys_id: 'abc123...',      // Sys ID du record
        record_name: 'My BR',            // Nom affiché
        record_filter: 'collection=...',  // Filtre pour liste (au lieu de sys_id)

        // Métriques
        actual: '100',                   // Valeur actuelle
        expected: '50',                  // Valeur attendue
        threshold: 30,                   // Seuil
        count: 81,                       // Comptage
        percentage: 150,                 // Pourcentage

        // Autres
        recommendation: 'Action...',     // Recommandation
        field: 'script',                 // Champ concerné
        // ... autres détails pertinents
    }
}
```

---

## 🎨 Patterns Courants

### Pattern 1 : Vérifier longueur de script

```javascript
if (item.values.script) {
  var lineCount = (item.values.script.match(/\n/g) || []).length + 1;
  if (lineCount > 100) {
    issues.push({
      code: rule.code,
      message: "Script too long: " + lineCount + " lines",
      severity: "medium",
      details: {
        line_count: lineCount,
        record_table: item.table,
        record_sys_id: item.sys_id,
      },
    });
  }
}
```

### Pattern 2 : Vérifier multiple conditions

```javascript
var problems = [];
if (!item.values.description) problems.push("missing description");
if (!item.values.priority) problems.push("missing priority");
if (item.values.active !== "true") problems.push("inactive");

if (problems.length > 0) {
  issues.push({
    code: rule.code,
    message: "Issues found: " + problems.join(", "),
    severity: "medium",
    details: {
      problems: problems,
      record_table: item.table,
      record_sys_id: item.sys_id,
    },
  });
}
```

### Pattern 3 : Query externe

```javascript
// Vérifier s'il existe des ACLs pour cette table
var gr = new GlideRecord("sys_security_acl");
gr.addQuery("name", item.values.name);
gr.setLimit(1);
gr.query();

if (!gr.hasNext()) {
  issues.push({
    code: rule.code,
    message: "No ACLs found for table " + item.values.name,
    severity: "high",
    details: {
      table_name: item.values.name,
      record_table: item.table,
      record_sys_id: item.sys_id,
    },
  });
}
```

---

## 🚨 Erreurs Fréquentes

### ❌ Mauvais

```javascript
// Pas de message clair
issues.push({ code: rule.code, message: "Problem" });

// Pas de détails
issues.push({ code: rule.code, message: "BR is bad", severity: "high" });

// Handler agrégé sans flag
if (context.totalCount > 50) {
  issues.push({
    /* ... */
  }); // Sera appelé N fois !
}
```

### ✅ Bon

```javascript
// Message clair et détails complets
issues.push({
  code: rule.code,
  message:
    'Business Rule "' + item.values.name + '" is too complex (120 lines)',
  severity: "medium",
  details: {
    line_count: 120,
    threshold: 100,
    record_table: item.table,
    record_sys_id: item.sys_id,
    record_name: item.values.name,
    recommendation: "Break down into smaller functions",
  },
});

// Handler agrégé avec flag
if (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};
var key = "check_" + rule.code;
if (!context._aggregateIssuesFired[key]) {
  if (context.totalCount > 50) {
    context._aggregateIssuesFired[key] = true;
    issues.push({
      /* ... */
    }); // Appelé 1 seule fois
  }
}
```

---

## 🧪 Debug

### Activer les logs

```javascript
// Au début du script
gs.info("=== DEBUG " + rule.code + " ===");
gs.info("Item sys_id: " + item.sys_id);
gs.info("Item values: " + JSON.stringify(item.values));
gs.info("Context: " + JSON.stringify(context));
```

### Lire les logs

1. Aller dans **System Logs** (`/sys_log_list.do`)
2. Filtrer par `[FHARuleEvaluator]` ou votre message
3. Vérifier les erreurs ou valeurs

---

## 📚 Docs Complètes

| Document                                                   | Quand l'utiliser                            |
| ---------------------------------------------------------- | ------------------------------------------- |
| [HANDLERS_REFERENCE.md](./HANDLERS_REFERENCE.md)           | Référence complète avec tous les paramètres |
| [SCRIPTS_LIBRARY.md](./SCRIPTS_LIBRARY.md)                 | Copier des scripts prêts à l'emploi         |
| [MIGRATION_GUIDE_v2.md](../MIGRATION_GUIDE_v2.md)          | Migrer vers handlers v2.0                   |
| [aggregate-handlers.md](../patterns/aggregate-handlers.md) | Pattern d'agrégation détaillé               |

---

## 🎓 Formation Express (30 min)

1. **Lire** cette carte (5 min)
2. **Copier** un script de SCRIPTS_LIBRARY.md (5 min)
3. **Créer** une règle dans ServiceNow (10 min)
4. **Tester** avec une analyse (10 min)

---

**Version** : 2.0.0  
**Mise à jour** : 2026-01-16
