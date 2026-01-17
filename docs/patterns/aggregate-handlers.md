# Pattern : Handlers agrégés

## 📋 Contexte

Certains handlers doivent évaluer un **groupe d'enregistrements** plutôt que des enregistrements individuels. Par exemple :

- Compter le nombre total de Business Rules sur une table
- Vérifier si le nombre d'enregistrements dépasse un seuil
- Détecter des problèmes au niveau du dataset complet

## ❌ Problème

Par défaut, `FHARuleEvaluator.evaluate()` est appelé **pour chaque enregistrement** du résultat. Si un handler retourne une issue à chaque appel basé sur un comptage global, cela génère des **duplicatas**.

**Exemple :**

```javascript
// ❌ MAUVAIS : génère N issues identiques
br_density: function(item, rule, params, context) {
    var count = context && context.totalCount;  // 81
    var threshold = params.threshold || 0;      // 30
    if (threshold && count > threshold) {
        return [this._issue(rule, 'Too many Business Rules (' + count + ' > ' + threshold + ')')];
    }
    return [];
}
// Résultat : 81 issues identiques 😞
```

## ✅ Solution : Pattern d'agrégation

Utiliser un **flag dans le contexte** pour s'assurer que l'issue n'est retournée qu'**une seule fois**.

### Template de code

```javascript
aggregate_handler: function(item, rule, params, context) {
    // 1. Récupérer les données nécessaires
    var count = context && context.totalCount;
    var threshold = params.threshold || 0;

    // 2. Pattern d'agrégation : une seule issue par dataset
    if (!context) context = {};
    if (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};
    var key = 'handler_name_' + rule.code;  // Clé unique par handler + rule

    // 3. Si déjà déclenché, ne rien retourner
    if (context._aggregateIssuesFired[key]) return [];

    // 4. Vérifier la condition
    if (threshold && count > threshold) {
        // 5. Marquer comme déclenché
        context._aggregateIssuesFired[key] = true;

        // 6. Construire un message informatif
        var message = '...';

        // 7. Ajouter des détails personnalisés
        var details = {
            count: count,
            threshold: threshold,
            record_table: 'target_table',
            record_filter: 'field=value',
            record_name: 'View records'
        };

        // 8. Retourner l'issue une seule fois
        return [this._issue(rule, message, details)];
    }

    return [];
}
```

## 📝 Checklist d'implémentation

### 1. Identifier le besoin d'agrégation

- [ ] Le handler analyse un **groupe d'enregistrements** (dataset)
- [ ] Le handler utilise `context.totalCount` ou des métriques globales
- [ ] Une seule issue doit être générée pour tout le dataset

### 2. Implémenter le pattern

- [ ] Initialiser `context._aggregateIssuesFired` si absent
- [ ] Créer une clé unique : `'handler_name_' + rule.code`
- [ ] Vérifier si déjà déclenché : `if (context._aggregateIssuesFired[key]) return [];`
- [ ] Marquer comme déclenché avant de retourner l'issue

### 3. Enrichir l'issue

- [ ] Message clair et actionnable
- [ ] Détails avec `record_table` si pertinent
- [ ] Détails avec `record_filter` pour un lien direct
- [ ] Détails avec `record_name` pour le texte du lien

### 4. Propager les métadonnées

Dans `FHAnalysisEngine._analyzeResults()`, s'assurer que les champs personnalisés sont propagés :

```javascript
aggregatedIssues.push({
  code: is.code || "",
  message: is.message || "",
  severity: is.severity || "medium",
  record_table: issueDetails.record_table || item.table || "",
  record_sys_id: issueDetails.record_sys_id || item.sys_id || "",
  record_name:
    issueDetails.record_name || (item.values && item.values.name) || "",
  record_filter: issueDetails.record_filter || "", // ✅ Important
  category: item.category || "",
  details: issueDetails,
});
```

## 🎯 Exemples d'application

### Exemple 1 : Densité de Business Rules

```javascript
br_density: function(item, rule, params, context) {
    var count = context && context.totalCount;
    var threshold = params.threshold || 0;

    if (!context) context = {};
    if (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};
    var key = 'br_density_' + rule.code;
    if (context._aggregateIssuesFired[key]) return [];

    if (threshold && count > threshold) {
        context._aggregateIssuesFired[key] = true;

        var tableValue = item.values && item.values.collection ? item.values.collection : 'unknown';
        var message = 'Too many Business Rules (' + count + ' > ' + threshold + ') - Table: ' + tableValue;

        return [this._issue(rule, message, {
            count: count,
            threshold: threshold,
            table: tableValue,
            record_table: 'sys_script',
            record_filter: 'collection=' + tableValue + '^active=true',
            record_name: 'View ' + count + ' Business Rules'
        })];
    }
    return [];
}
```

### Exemple 2 : Seuil de comptage générique

```javascript
count_threshold: function(item, rule, params, context) {
    var threshold = params.threshold || 0;
    var total = (context && context.totalCount) || 0;

    if (!context) context = {};
    if (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};
    var key = 'count_threshold_' + rule.code;
    if (context._aggregateIssuesFired[key]) return [];

    if (threshold && total > threshold) {
        context._aggregateIssuesFired[key] = true;

        var message = 'Too many records (' + total + ' > ' + threshold + '). Review and clean up unnecessary records.';

        return [this._issue(rule, message, {
            count: total,
            threshold: threshold
        })];
    }
    return [];
}
```

### Exemple 3 : Densité de Client Scripts

```javascript
cs_density: function(item, rule, params, context) {
    var count = context && context.totalCount;
    var threshold = params.threshold || 0;

    if (!context) context = {};
    if (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};
    var key = 'cs_density_' + rule.code;
    if (context._aggregateIssuesFired[key]) return [];

    if (threshold && count > threshold) {
        context._aggregateIssuesFired[key] = true;

        var tableValue = item.values && item.values.table ? item.values.table : 'unknown';
        var message = 'Too many Client Scripts (' + count + ' > ' + threshold + ') - Table: ' + tableValue;

        return [this._issue(rule, message, {
            count: count,
            threshold: threshold,
            table: tableValue,
            record_table: 'sys_script_client',
            record_filter: 'table=' + tableValue + '^active=true',
            record_name: 'View ' + count + ' Client Scripts'
        })];
    }
    return [];
}
```

## 🧪 Tests

### Test unitaire conceptuel

```javascript
// Setup
var context = { totalCount: 81, _aggregateIssuesFired: {} };
var rule = { code: "BR_TOO_MANY", severity: "medium" };
var params = { threshold: 30 };

// Créer 81 items
var items = [];
for (var i = 0; i < 81; i++) {
  items.push({
    sys_id: "test_" + i,
    table: "sys_script",
    values: { collection: "incident" },
  });
}

// Évaluer sur tous les items
var totalIssues = 0;
items.forEach(function (item) {
  var issues = evaluator.br_density(item, rule, params, context);
  totalIssues += issues.length;
});

// Vérification
gs.info("Total issues: " + totalIssues); // Devrait afficher : 1 ✅
```

## 🎁 Avantages du pattern

1. **Évite les duplicatas** : Une seule issue par problème global
2. **Performance** : Moins de données à traiter et afficher
3. **Clarté** : Interface utilisateur plus lisible
4. **Actionnable** : Liens directs vers les enregistrements concernés
5. **Réutilisable** : Pattern applicable à tous les handlers agrégés

## ⚠️ Pièges à éviter

### ❌ Oublier de marquer comme déclenché

```javascript
// MAUVAIS
if (threshold && count > threshold) {
  // Oubli de : context._aggregateIssuesFired[key] = true;
  return [this._issue(rule, message, details)];
}
```

### ❌ Clé non unique

```javascript
// MAUVAIS : même clé pour toutes les règles
var key = "br_density";

// BON : clé unique par règle
var key = "br_density_" + rule.code;
```

### ❌ Ne pas initialiser le contexte

```javascript
// MAUVAIS : erreur si context est null
context._aggregateIssuesFired[key] = true;

// BON : toujours initialiser
if (!context) context = {};
if (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};
```

## 📚 Références

- Issue originale : 86 issues `BR_TOO_MANY` au lieu de 1
- Commit : Voir `CHANGELOG_ISSUES_AGGREGATION.md`
- Tests : Voir `TESTING_GUIDE_ISSUES.md`

---

**Version :** 1.0.0  
**Date :** 2026-01-16  
**Auteur :** Claude (IA Assistant)
