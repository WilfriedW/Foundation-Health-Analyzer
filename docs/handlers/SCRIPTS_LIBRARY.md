# Bibliothèque de Scripts pour les Règles de Vérification

## 📘 Introduction

Ce document contient des exemples de scripts réutilisables pour le champ `script` des règles de vérification. Ces scripts remplacent les anciens handlers booléens et permettent une logique métier plus flexible.

## 🎯 Structure d'un script

```javascript
// Variables disponibles :
// - item: l'enregistrement analysé {sys_id, table, category, values: {...}}
// - rule: la règle {code, severity, params}
// - params: paramètres JSON de la règle
// - context: contexte d'exécution {totalCount, _dupsSeen, ...}
// - issues: tableau à remplir

// Exemple basique
if (condition) {
  issues.push({
    code: rule.code,
    message: "Votre message",
    severity: rule.severity || "medium",
    details: {
      record_table: item.table,
      record_sys_id: item.sys_id,
      record_name: item.values.name,
      // autres détails personnalisés
    },
  });
}
```

## 📚 Catégories de scripts

### 1. Automation - Business Rules

#### BR Heavy (Business Rule trop lourde)

```javascript
// Vérifie si le script de la BR est trop long
if (item.values.script) {
  var script = item.values.script.toString();
  var lineCount = (script.match(/\n/g) || []).length + 1;
  var charCount = script.length;

  if (lineCount > 100 || charCount > 2000) {
    issues.push({
      code: rule.code,
      message:
        'Business Rule "' +
        item.values.name +
        '" is too complex: ' +
        lineCount +
        " lines, " +
        charCount +
        " characters. Consider refactoring into Script Include.",
      severity: lineCount > 200 ? "high" : "medium",
      details: {
        line_count: lineCount,
        char_count: charCount,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: item.values.name,
        recommendation: "Break down into smaller functions in a Script Include",
      },
    });
  }
}
```

#### BR avec conditions complexes

```javascript
// Vérifie les BR avec des conditions trop complexes
if (item.values.condition) {
  var condition = item.values.condition.toString();
  var complexity = 0;

  // Compte les opérateurs logiques
  complexity += (condition.match(/\^OR/g) || []).length * 2;
  complexity += (condition.match(/\^/g) || []).length;
  complexity += (condition.match(/javascript:/g) || []).length * 5;

  if (complexity > 10) {
    issues.push({
      code: rule.code,
      message:
        'Business Rule "' +
        item.values.name +
        '" has overly complex conditions (complexity: ' +
        complexity +
        "). Simplify or move to script.",
      severity: "medium",
      details: {
        complexity_score: complexity,
        condition_length: condition.length,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: item.values.name,
      },
    });
  }
}
```

#### BR "Display" exécutées côté serveur

```javascript
// Détecte les BR de type "display" exécutées côté serveur
if (item.values.when === "display_business_rule") {
  var runServer =
    item.values.execute_function === "true" ||
    (item.values.script && item.values.script.length > 0);

  if (runServer) {
    issues.push({
      code: rule.code,
      message:
        'Display Business Rule "' +
        item.values.name +
        '" executes server-side code. Consider using Client Script or UI Policy instead.',
      severity: "medium",
      details: {
        when: item.values.when,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: item.values.name,
        recommendation: "Use Client Script or UI Policy for display logic",
      },
    });
  }
}
```

### 2. Automation - Client Scripts

#### Client Script Heavy

```javascript
// Vérifie si le Client Script est trop lourd
if (item.values.script) {
  var script = item.values.script.toString();
  var lineCount = (script.match(/\n/g) || []).length + 1;

  // Recherche d'anti-patterns
  var hasGlideAjax = script.indexOf("GlideAjax") !== -1;
  var hasLoops = /for\s*\(|while\s*\(/.test(script);
  var hasDOMManip = /document\.|getElementById|querySelector/.test(script);

  var issues_found = [];
  if (lineCount > 50) issues_found.push(lineCount + " lines");
  if (hasGlideAjax) issues_found.push("GlideAjax call");
  if (hasLoops) issues_found.push("loops");
  if (hasDOMManip) issues_found.push("DOM manipulation");

  if (issues_found.length > 0) {
    issues.push({
      code: rule.code,
      message:
        'Client Script "' +
        item.values.name +
        '" may impact performance: ' +
        issues_found.join(", ") +
        ".",
      severity: issues_found.length > 2 ? "high" : "medium",
      details: {
        line_count: lineCount,
        has_ajax: hasGlideAjax,
        has_loops: hasLoops,
        has_dom_manip: hasDOMManip,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: item.values.name,
        recommendation:
          "Optimize by reducing complexity and avoiding synchronous operations",
      },
    });
  }
}
```

### 3. Security - ACLs

#### ACL trop permissive

```javascript
// Détecte les ACLs avec des conditions trop larges
if (item.values.operation && item.values.admin_overrides !== "true") {
  var type = item.values.type || "";
  var script = item.values.script || "";

  // Vérifications
  var hasRole = item.values.roles && item.values.roles.length > 0;
  var hasCondition = item.values.condition && item.values.condition.length > 10;
  var hasScript = script.length > 10;

  // ACL sans protection
  if (!hasRole && !hasCondition && !hasScript) {
    issues.push({
      code: rule.code,
      message:
        'ACL "' +
        item.values.name +
        '" has no restrictions (no role, condition, or script). ' +
        "This grants access to everyone.",
      severity: "high",
      details: {
        operation: item.values.operation,
        type: type,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: item.values.name,
        recommendation:
          "Add role requirements, conditions, or script restrictions",
      },
    });
  }

  // ACL avec script "return true"
  if (hasScript && /return\s+true\s*;?\s*$/.test(script.trim())) {
    issues.push({
      code: rule.code,
      message:
        'ACL "' +
        item.values.name +
        '" script always returns true. Remove or add logic.',
      severity: "high",
      details: {
        script_preview: script.substring(0, 100),
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: item.values.name,
      },
    });
  }
}
```

#### ACL manquante sur table sensible

```javascript
// Vérifie qu'il existe des ACLs pour les opérations sensibles
// NOTE: Ce script nécessite d'être sur une règle analysant les tables
if (
  params.sensitive_tables &&
  params.sensitive_tables.indexOf(item.values.name) !== -1
) {
  // Vérifier s'il y a des ACLs (nécessite une query)
  var gr = new GlideRecord("sys_security_acl");
  gr.addQuery("name", item.values.name);
  gr.addQuery("operation", "read");
  gr.query();

  if (!gr.hasNext()) {
    issues.push({
      code: rule.code,
      message:
        'Sensitive table "' +
        item.values.name +
        '" has no READ ACL. ' +
        "All users may be able to read data.",
      severity: "high",
      details: {
        table_name: item.values.name,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: item.values.name,
        recommendation:
          "Create ACLs to restrict access to authorized users only",
      },
    });
  }
}
```

### 4. Scheduled Jobs

#### Job en erreur

```javascript
// Vérifie les Scheduled Jobs avec des erreurs récentes
if (item.values.active === "true") {
  // Chercher les erreurs dans sys_trigger
  var errorGr = new GlideRecord("sys_trigger");
  errorGr.addQuery("name", item.values.name);
  errorGr.addQuery("state", "error");
  errorGr.orderByDesc("sys_created_on");
  errorGr.setLimit(1);
  errorGr.query();

  if (errorGr.next()) {
    var errorTime = errorGr.sys_created_on.getDisplayValue();
    var errorMsg = errorGr.error_string || "Unknown error";

    issues.push({
      code: rule.code,
      message:
        'Scheduled Job "' +
        item.values.name +
        '" has errors. Last error at ' +
        errorTime +
        ": " +
        errorMsg.substring(0, 100),
      severity: "high",
      details: {
        last_error: errorTime,
        error_message: errorMsg,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: item.values.name,
        recommendation: "Review job logs and fix the underlying issue",
      },
    });
  }
}
```

#### Job inactif depuis longtemps

```javascript
// Vérifie les jobs qui n'ont pas été exécutés depuis longtemps
if (item.values.active === "true") {
  var lastRun = item.values.last_run;
  if (lastRun) {
    var lastRunDate = new GlideDateTime(lastRun);
    var now = new GlideDateTime();
    var daysDiff = gs.dateDiff(lastRunDate.getValue(), now.getValue(), true);
    var days = Math.floor(daysDiff / 86400); // secondes -> jours

    if (days > 30) {
      issues.push({
        code: rule.code,
        message:
          'Scheduled Job "' +
          item.values.name +
          '" active but not run for ' +
          days +
          " days. Check schedule or deactivate if not needed.",
        severity: days > 90 ? "high" : "medium",
        details: {
          last_run: lastRun,
          days_since_run: days,
          record_table: item.table,
          record_sys_id: item.sys_id,
          record_name: item.values.name,
          recommendation: "Review schedule or deactivate unused job",
        },
      });
    }
  }
}
```

### 5. Integration - REST Messages

#### REST sans timeout

```javascript
// Vérifie les REST Messages sans timeout configuré
if (item.values.rest_endpoint) {
  var timeout = item.values.rest_timeout || item.values.timeout;
  var timeoutValue = parseInt(timeout) || 0;

  if (timeoutValue === 0 || timeoutValue > 60) {
    issues.push({
      code: rule.code,
      message:
        'REST Message "' +
        item.values.name +
        '" has no timeout or excessive timeout (' +
        timeoutValue +
        "s). This may cause performance issues.",
      severity: timeoutValue === 0 ? "high" : "medium",
      details: {
        timeout: timeoutValue,
        endpoint: item.values.rest_endpoint,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: item.values.name,
        recommendation: "Set a reasonable timeout (10-30 seconds)",
      },
    });
  }
}
```

#### REST sans gestion d'erreur

```javascript
// Vérifie les REST Messages sans HTTP Status Codes configurés
if (item.values.rest_endpoint) {
  // Vérifier s'il y a des status codes configurés
  var statusGr = new GlideRecord("sys_rest_message_fn_status");
  statusGr.addQuery("rest_message_fn", item.sys_id);
  statusGr.query();

  if (!statusGr.hasNext()) {
    issues.push({
      code: rule.code,
      message:
        'REST Message "' +
        item.values.name +
        '" has no HTTP Status Codes configured. ' +
        "Add error handling for better reliability.",
      severity: "medium",
      details: {
        endpoint: item.values.rest_endpoint,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: item.values.name,
        recommendation: "Configure HTTP Status Codes for proper error handling",
      },
    });
  }
}
```

### 6. UI - Widgets & Portals

#### Widget sans cache

```javascript
// Vérifie les widgets sans cache activé
if (item.values.data_table || item.values.option_schema) {
  var hasCache = item.values.css && item.values.css.indexOf("cache") !== -1;
  var hasPagination =
    item.values.option_schema &&
    item.values.option_schema.indexOf("pagination") !== -1;

  if (!hasCache && !hasPagination) {
    issues.push({
      code: rule.code,
      message:
        'Widget "' +
        item.values.name +
        '" may have performance issues: ' +
        "no caching and no pagination detected.",
      severity: "medium",
      details: {
        data_table: item.values.data_table,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: item.values.name,
        recommendation:
          "Implement caching or pagination for better performance",
      },
    });
  }
}
```

### 7. Data - Tables & Fields

#### Table sans audit

```javascript
// Vérifie les tables sensibles sans audit activé
if (params.require_audit === "true") {
  var auditEnabled =
    item.values.is_audited === "true" || item.values.sys_policy === "audited";

  if (!auditEnabled) {
    issues.push({
      code: rule.code,
      message:
        'Table "' +
        item.values.name +
        '" does not have audit enabled. ' +
        "Enable auditing for compliance and tracking.",
      severity: "high",
      details: {
        table_name: item.values.name,
        label: item.values.label,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: item.values.name,
        recommendation: "Enable audit on this table for compliance",
      },
    });
  }
}
```

### 8. Notification

#### Notification spam risk

```javascript
// Détecte les notifications qui peuvent générer du spam
if (item.values.active === "true") {
  var conditions = item.values.condition || "";
  var sendIf = item.values.send_if || "";

  // Vérifications
  var hasThrottling = conditions.indexOf("last_notified") !== -1;
  var hasOnce = sendIf.indexOf("once") !== -1;
  var hasBatch = item.values.batch === "true";

  if (!hasThrottling && !hasOnce && !hasBatch) {
    issues.push({
      code: rule.code,
      message:
        'Notification "' +
        item.values.name +
        '" may send spam: ' +
        'no throttling, "send once", or batching configured.',
      severity: "medium",
      details: {
        send_if: sendIf,
        has_condition: conditions.length > 0,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: item.values.name,
        recommendation: 'Add throttling or "send once" logic to prevent spam',
      },
    });
  }
}
```

## 🔧 Scripts utilitaires

### Script de debug

```javascript
// Pour débugger : afficher toutes les valeurs de l'item
gs.info("=== DEBUG ITEM ===");
gs.info("sys_id: " + item.sys_id);
gs.info("table: " + item.table);
gs.info("category: " + item.category);
for (var key in item.values) {
  gs.info(key + ": " + item.values[key]);
}
gs.info("==================");
```

### Template de script avec agrégation

```javascript
// Pour les règles agrégées (une seule issue pour tout le dataset)
if (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};
var key = "my_custom_check_" + rule.code;

if (!context._aggregateIssuesFired[key]) {
  var count = context.totalCount || 0;
  var threshold = params.threshold || 50;

  if (count > threshold) {
    context._aggregateIssuesFired[key] = true;

    issues.push({
      code: rule.code,
      message: "Too many records: " + count + " (threshold: " + threshold + ")",
      severity: "medium",
      details: {
        count: count,
        threshold: threshold,
      },
    });
  }
}
```

## 📖 Bonnes pratiques

1. **Messages clairs** : Toujours inclure le nom de l'enregistrement et une explication
2. **Recommandations** : Ajouter des suggestions concrètes dans les détails
3. **Liens directs** : Utiliser `record_table`, `record_sys_id`, `record_filter` pour la navigation
4. **Sévérité adaptée** : Utiliser `high` pour les problèmes critiques, `medium` pour les avertissements, `low` pour les suggestions
5. **Performance** : Éviter les queries lourdes dans les scripts (max 1-2 queries simples)
6. **Réutilisabilité** : Utiliser les paramètres `params` pour rendre les scripts configurables

---

**Date :** 2026-01-16  
**Version :** 1.0.0
