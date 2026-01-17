# Guide de Migration vers Handlers v2.0

## 🎯 Objectif

Ce guide vous aide à migrer vos règles de vérification vers la nouvelle architecture simplifiée avec :

- **Handlers génériques** : Plus flexibles et réutilisables
- **Scripts personnalisés** : Logique métier dans les règles, pas dans le code
- **Messages enrichis** : Plus informatifs et actionnables

## 📋 Vue d'ensemble des changements

### Handlers supprimés / simplifiés

Les handlers suivants restent disponibles mais **devraient être remplacés** par des scripts personnalisés :

| Handler ancien       | Remplacement recommandé | Raison                    |
| -------------------- | ----------------------- | ------------------------- |
| `missing_acl`        | Script personnalisé     | Logique métier spécifique |
| `acl_issue`          | Script personnalisé     | Logique métier spécifique |
| `index_needed`       | Script personnalisé     | Logique métier spécifique |
| `risky_field`        | Script personnalisé     | Logique métier spécifique |
| `public_endpoint`    | Script personnalisé     | Logique métier spécifique |
| `public_access`      | Script personnalisé     | Logique métier spécifique |
| `br_heavy`           | Script personnalisé     | Logique métier spécifique |
| `cs_heavy`           | Script personnalisé     | Logique métier spécifique |
| `ui_action`          | Script personnalisé     | Logique métier spécifique |
| `job_error`          | Script personnalisé     | Logique métier spécifique |
| `job_inactive`       | Script personnalisé     | Logique métier spécifique |
| `flow_error`         | Script personnalisé     | Logique métier spécifique |
| `flow_config`        | Script personnalisé     | Logique métier spécifique |
| `notification`       | Script personnalisé     | Logique métier spécifique |
| `integration_error`  | Script personnalisé     | Logique métier spécifique |
| `integration_config` | Script personnalisé     | Logique métier spécifique |
| `widget_perf`        | Script personnalisé     | Logique métier spécifique |
| `query_scan`         | Script personnalisé     | Logique métier spécifique |
| `script_weight`      | Script personnalisé     | Logique métier spécifique |
| `audit`              | Script personnalisé     | Logique métier spécifique |
| `security`           | Script personnalisé     | Logique métier spécifique |
| `catalog`            | Script personnalisé     | Logique métier spécifique |
| `mail_config`        | Script personnalisé     | Logique métier spécifique |
| `observability`      | Script personnalisé     | Logique métier spécifique |

### Nouveaux handlers génériques

| Handler            | Description                         | Cas d'usage                         |
| ------------------ | ----------------------------------- | ----------------------------------- |
| `field_check`      | Vérification générique de champ     | Remplace tous les handlers booléens |
| `pattern_scan`     | Scan de patterns regex              | Recherche de patterns dans le code  |
| `aggregate_metric` | Métriques agrégées personnalisables | Comptages et calculs sur datasets   |

## 🚀 Plan de migration en 3 phases

### Phase 1 : Migration des handlers booléens simples (Recommandé)

**Durée estimée :** 1-2 heures

#### Étape 1 : Identifier vos règles actuelles

```sql
-- Lister toutes les règles avec des handlers legacy
SELECT name, code, type
FROM x_1310794_founda_0_issue_rules
WHERE type IN ('missing_acl', 'acl_issue', 'br_heavy', 'cs_heavy', 'job_error',
               'flow_error', 'integration_error', 'widget_perf', 'query_scan')
ORDER BY type, name
```

#### Étape 2 : Pour chaque règle, copier le script approprié

Référez-vous à `SCRIPTS_LIBRARY.md` et copiez le script correspondant dans le champ `script` de la règle.

**Exemple concret :**

**Avant :**

```
Name: Heavy Business Rule
Code: BR_HEAVY
Type: br_heavy
Params: {}
Script: (vide)
```

**Après :**

```
Name: Heavy Business Rule
Code: BR_HEAVY
Type: (vide ou garder br_heavy)
Params: {}
Script:
if (item.values.script) {
    var script = item.values.script.toString();
    var lineCount = (script.match(/\n/g) || []).length + 1;
    var charCount = script.length;

    if (lineCount > 100 || charCount > 2000) {
        issues.push({
            code: rule.code,
            message: 'Business Rule "' + item.values.name + '" is too complex: ' +
                     lineCount + ' lines, ' + charCount + ' characters. Consider refactoring into Script Include.',
            severity: lineCount > 200 ? 'high' : 'medium',
            details: {
                line_count: lineCount,
                char_count: charCount,
                record_table: item.table,
                record_sys_id: item.sys_id,
                record_name: item.values.name,
                recommendation: 'Break down into smaller functions in a Script Include'
            }
        });
    }
}
```

#### Étape 3 : Tester chaque règle migrée

1. Créer ou lancer une analyse
2. Vérifier que les issues sont toujours générées
3. Vérifier que les messages sont plus informatifs

### Phase 2 : Utiliser les nouveaux handlers génériques (Optionnel)

**Durée estimée :** 2-3 heures

#### Utiliser field_check pour les vérifications simples

**Avant (3 règles distinctes) :**

```json
{
  "name": "Missing ACL",
  "type": "missing_acl",
  "params": "{}"
}
```

**Après (1 règle flexible) :**

```json
{
  "name": "Missing ACL",
  "type": "field_check",
  "params": "{\"field\": \"missing_acl\", \"operator\": \"equals\", \"expected\": \"true\", \"message_template\": \"Table without ACL detected\"}"
}
```

#### Avantages

1. **Réutilisabilité** : Un seul handler pour de nombreux cas
2. **Flexibilité** : Paramètres configurables sans changer le code
3. **Maintenabilité** : Moins de code à maintenir

### Phase 3 : Optimiser les messages et détails (Recommandé)

**Durée estimée :** 1-2 heures

Pour chaque script personnalisé, enrichissez les détails :

```javascript
// Minimum
issues.push({
  code: rule.code,
  message: "Problem detected",
  severity: "medium",
});

// Enrichi (recommandé)
issues.push({
  code: rule.code,
  message: "Clear description with context and recommendation",
  severity: "medium",
  details: {
    // Liens directs
    record_table: item.table,
    record_sys_id: item.sys_id,
    record_name: item.values.name,
    record_filter: "field=value", // Pour afficher une liste

    // Métriques
    actual_value: "valeur actuelle",
    expected_value: "valeur attendue",
    threshold: 100,

    // Recommandation
    recommendation: "Suggestion concrète pour résoudre le problème",
  },
});
```

## 📊 Checklist de migration

### Pour chaque règle à migrer

- [ ] Identifier le handler actuel
- [ ] Trouver le script de remplacement dans `SCRIPTS_LIBRARY.md`
- [ ] Copier le script dans le champ `script` de la règle
- [ ] Ajuster les paramètres si nécessaire
- [ ] Tester la règle sur une analyse test
- [ ] Vérifier que les issues sont générées correctement
- [ ] Vérifier que les liens/filtres fonctionnent
- [ ] Documenter les changements

### Pour l'ensemble du système

- [ ] Migrer toutes les règles critiques (high severity)
- [ ] Migrer les règles medium severity
- [ ] Migrer les règles low severity
- [ ] Nettoyer les anciens handlers (optionnel, garder pour compatibilité)
- [ ] Former les utilisateurs aux nouvelles fonctionnalités
- [ ] Mettre à jour la documentation interne

## 🎓 Exemples de migration complets

### Exemple 1 : Job Error

**Avant :**

```
Table: x_1310794_founda_0_issue_rules

Name: Job with errors
Code: JOB_ERROR
Type: job_error
Severity: high
Params: {}
Script: (empty)
```

**Après :**

```
Table: x_1310794_founda_0_issue_rules

Name: Job with errors
Code: JOB_ERROR
Type: (empty or keep job_error for compatibility)
Severity: high
Params: {}
Script:
// Vérifie les Scheduled Jobs avec des erreurs récentes
if (item.values.active === 'true') {
    // Chercher les erreurs dans sys_trigger
    var errorGr = new GlideRecord('sys_trigger');
    errorGr.addQuery('name', item.values.name);
    errorGr.addQuery('state', 'error');
    errorGr.orderByDesc('sys_created_on');
    errorGr.setLimit(1);
    errorGr.query();

    if (errorGr.next()) {
        var errorTime = errorGr.sys_created_on.getDisplayValue();
        var errorMsg = errorGr.error_string || 'Unknown error';

        issues.push({
            code: rule.code,
            message: 'Scheduled Job "' + item.values.name + '" has errors. Last error at ' +
                     errorTime + ': ' + errorMsg.substring(0, 100),
            severity: 'high',
            details: {
                last_error: errorTime,
                error_message: errorMsg,
                record_table: item.table,
                record_sys_id: item.sys_id,
                record_name: item.values.name,
                recommendation: 'Review job logs and fix the underlying issue'
            }
        });
    }
}
```

### Exemple 2 : Missing ACL

**Avant :**

```
Name: Missing ACL
Code: MISSING_ACL
Type: missing_acl
Severity: high
Params: {}
Script: (empty)
```

**Option A - Script personnalisé (recommandé pour logique complexe) :**

```
Name: Missing ACL
Code: MISSING_ACL
Type: (empty)
Severity: high
Params: {}
Script:
// Vérifie les ACLs sur les tables sensibles
if (item.values.acl_count) {
    var aclCount = parseInt(item.values.acl_count) || 0;

    if (aclCount === 0) {
        issues.push({
            code: rule.code,
            message: 'Sensitive table "' + item.values.name + '" has no ACLs. All users may have unrestricted access.',
            severity: 'high',
            details: {
                table_name: item.values.name,
                record_table: item.table,
                record_sys_id: item.sys_id,
                record_name: item.values.name,
                recommendation: 'Create ACLs to restrict access to authorized users only'
            }
        });
    }
}
```

**Option B - field_check (pour vérifications simples) :**

```
Name: Missing ACL
Code: MISSING_ACL
Type: field_check
Severity: high
Params: {"field": "acl_count", "operator": "equals", "expected": "0"}
Script: (empty)
```

### Exemple 3 : BR Density (déjà migré)

**Avant :**

```
Name: Too many Business Rules
Code: BR_TOO_MANY
Type: br_density
Severity: medium
Params: {"threshold": 30}
Script: (empty)
```

**Après (déjà fait dans v2.0) :**

```
Name: Too many Business Rules
Code: BR_TOO_MANY
Type: br_density
Severity: medium
Params: {"threshold": 30}
Script: (empty)

// Le handler a été amélioré automatiquement
// Message enrichi avec le nom de la table
// Lien direct vers la liste des BR
// Pattern d'agrégation appliqué (1 issue au lieu de 81)
```

## 🛠️ Scripts d'aide à la migration

### Script 1 : Exporter les règles actuelles

```javascript
// Script pour lister toutes les règles avec handlers legacy
var gr = new GlideRecord("x_1310794_founda_0_issue_rules");
gr.addQuery("active", true);
gr.addQuery("type", "IN", "missing_acl,acl_issue,br_heavy,cs_heavy,job_error");
gr.orderBy("type");
gr.query();

var results = [];
while (gr.next()) {
  results.push({
    name: gr.getValue("name"),
    code: gr.getValue("code"),
    type: gr.getValue("type"),
    severity: gr.getValue("severity"),
    sys_id: gr.getValue("sys_id"),
  });
}

gs.info("Found " + results.length + " rules to migrate:");
gs.info(JSON.stringify(results, null, 2));
```

### Script 2 : Backup des règles avant migration

```javascript
// Script pour sauvegarder les règles actuelles
var gr = new GlideRecord("x_1310794_founda_0_issue_rules");
gr.query();

var backup = [];
while (gr.next()) {
  backup.push({
    sys_id: gr.getValue("sys_id"),
    name: gr.getValue("name"),
    code: gr.getValue("code"),
    type: gr.getValue("type"),
    params: gr.getValue("params"),
    script: gr.getValue("script"),
    severity: gr.getValue("severity"),
  });
}

// Sauvegarder dans un fichier ou une table de backup
gs.info("Backup created: " + backup.length + " rules");
// Copier la sortie et sauvegarder dans un fichier JSON
```

## ⚠️ Précautions

1. **Backup** : Faites un backup de vos règles avant toute modification
2. **Tests** : Testez chaque règle migrée sur un environnement de test d'abord
3. **Compatibilité** : Les anciens handlers restent disponibles pour la rétrocompatibilité
4. **Performance** : Les scripts personnalisés ne doivent pas faire de queries lourdes
5. **Documentation** : Documentez vos scripts pour faciliter la maintenance

## 📚 Ressources

- **Bibliothèque de scripts** : `docs/handlers/SCRIPTS_LIBRARY.md`
- **Référence des handlers** : `docs/handlers/HANDLERS_REFERENCE.md`
- **Pattern d'agrégation** : `docs/patterns/aggregate-handlers.md`
- **Guide de test** : `TESTING_GUIDE_ISSUES.md`

## 🎉 Avantages après migration

1. **Flexibilité** : Logique métier modifiable sans changer le code
2. **Messages enrichis** : Plus informatifs et actionnables
3. **Maintenance** : Scripts plus simples à comprendre et modifier
4. **Performance** : Pattern d'agrégation évite les duplicatas
5. **Évolutivité** : Facile d'ajouter de nouveaux cas sans créer de handlers

---

**Date :** 2026-01-16  
**Version :** 2.0.0  
**Support :** Pour toute question, consulter la documentation complète ou contacter l'équipe
