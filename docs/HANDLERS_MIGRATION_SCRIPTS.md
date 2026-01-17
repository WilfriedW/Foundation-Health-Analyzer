# Migration des Handlers vers Scripts

> Ce document contient **tous les 29 handlers** convertis du format hardcodé (dans FHARuleEvaluator) vers le format **script** (pour la table `x_1310794_founda_0_issue_rules`).

---

## 📋 Table des Matières

### Handlers CORE (11)
1. [inactive](#1-inactive)
2. [system_created](#2-system_created)
3. [count_threshold](#3-count_threshold)
4. [missing_field](#4-missing_field)
5. [size_threshold](#5-size_threshold)
6. [duplicate](#6-duplicate)
7. [hardcoded_sys_id](#7-hardcoded_sys_id)
8. [br_density](#8-br_density)
9. [field_check](#9-field_check)
10. [pattern_scan](#10-pattern_scan)
11. [aggregate_metric](#11-aggregate_metric)

### Handlers LEGACY (18)
12. [missing_acl](#12-missing_acl)
13. [acl_issue](#13-acl_issue)
14. [index_needed](#14-index_needed)
15. [risky_field](#15-risky_field)
16. [public_endpoint](#16-public_endpoint)
17. [public_access](#17-public_access)
18. [br_heavy](#18-br_heavy)
19. [cs_heavy](#19-cs_heavy)
20. [ui_action](#20-ui_action)
21. [job_error](#21-job_error)
22. [job_inactive](#22-job_inactive)
23. [flow_error](#23-flow_error)
24. [flow_config](#24-flow_config)
25. [notification](#25-notification)
26. [integration_error](#26-integration_error)
27. [integration_config](#27-integration_config)
28. [widget_perf](#28-widget_perf)
29. [query_scan](#29-query_scan)
30. [script_weight](#30-script_weight)
31. [audit](#31-audit)
32. [security](#32-security)
33. [catalog](#33-catalog)
34. [mail_config](#34-mail_config)
35. [observability](#35-observability)

---

## 📝 Format de Script

Chaque script a accès aux variables suivantes :

```javascript
// Variables disponibles dans le script
item       // Record analysé { sys_id, table, category, values: {...} }
rule       // Règle { code, name, severity, params, ... }
params     // Paramètres parsés depuis rule.params (JSON)
context    // Contexte partagé { totalCount, _dupsSeen, _aggregateIssuesFired }
issue()    // Fonction helper : issue(rule, message, details)
issues     // Array à remplir : issues.push({ code, message, severity, details })
```

---

## HANDLERS CORE

### 1. inactive

**Type:** `inactive`  
**Code:** `INACTIVE_RECORD`  
**Params:** `{}`

```javascript
var activeVal = (item.values.active || '').toString().toLowerCase();
if (activeVal === 'false') {
    var recordName = item.values.name || item.values.title || 'Record';
    var message = 'Inactive record: "' + recordName + '". Consider activating or removing if no longer needed.';
    
    issues.push(issue(rule, message, {
        field: 'active',
        expected: 'true',
        actual: 'false',
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: recordName
    }));
}
```

---

### 2. system_created

**Type:** `system_created`  
**Code:** `SYSTEM_CREATED`  
**Params:** `{}`

```javascript
var createdBy = (item.values.sys_created_by || '').toString();
if (createdBy === 'system') {
    var recordName = item.values.name || item.values.title || 'Record';
    var message = 'Record "' + recordName + '" created by system user. Review ownership and ensure proper documentation.';
    
    issues.push(issue(rule, message, {
        field: 'sys_created_by',
        actual: 'system',
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: recordName,
        recommendation: 'System-created records should have clear documentation and ownership'
    }));
}
```

---

### 3. count_threshold

**Type:** `count_threshold`  
**Code:** `MANY_RECORDS`  
**Params:** `{"threshold": 50}`

```javascript

```

---

### 4. missing_field

**Type:** `missing_field`  
**Code:** `MISSING_FIELD`  
**Params:** `{"field": "description"}` ou `{"fields": "field1,field2"}`

```javascript
var fields = (params.field || params.fields || '').split(',');
var recordName = item.values.name || item.values.title || 'Record';

fields.forEach(function(fRaw) {
    var f = (fRaw || '').trim();
    if (!f) return;
    
    var v = item.values[f];
    if (v === undefined || v === null || v === '') {
        var message = 'Missing required field "' + f + '" in "' + recordName + '". This may cause issues or incomplete configuration.';
        
        issues.push(issue(rule, message, {
            field: f,
            record_table: item.table,
            record_sys_id: item.sys_id,
            record_name: recordName,
            recommendation: 'Fill in the ' + f + ' field to complete the configuration'
        }));
    }
});
```

---

### 5. size_threshold

**Type:** `size_threshold`  
**Code:** `SCRIPT_TOO_LONG`  
**Params:** `{"field": "script", "max_len": 2000}`

```javascript
var field = params.field || 'text';
var maxLen = params.max_len || 0;
var val = (item.values[field] || '').toString();
var recordName = item.values.name || item.values.title || 'Record';

if (maxLen && val.length > maxLen) {
    var percentage = Math.round((val.length / maxLen) * 100);
    var message = 'Field "' + field + '" too long in "' + recordName + '": ' + val.length + ' characters (limit: ' + maxLen + ', ' + percentage + '%). Consider refactoring or splitting.';
    
    issues.push(issue(rule, message, {
        field: field,
        length: val.length,
        max_length: maxLen,
        percentage: percentage,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: recordName,
        recommendation: 'Break down large ' + field + ' into smaller functions or modules'
    }));
}
```

---

### 6. duplicate

**Type:** `duplicate`  
**Code:** `DUPLICATE_RECORD`  
**Params:** `{"key_fields": "name,code"}`

```javascript
var keyFields = params.key_fields || 'name,code';
var fields = keyFields.split(',').map(function(f){ return (f || '').trim(); });

var keyParts = [];
fields.forEach(function(f) {
    keyParts.push(item.values[f] || '');
});
var key = keyParts.join('|');

var seen = context && context._dupsSeen;
if (seen && seen[key] && seen[key] !== item.sys_id) {
    var recordName = item.values.name || item.values.title || 'Record';
    var message = 'Duplicate detected: "' + recordName + '" has the same ' + fields.join(', ') + ' as another record. This may cause conflicts.';
    
    issues.push(issue(rule, message, {
        duplicate_of: seen[key],
        key_fields: fields,
        key_value: key,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: recordName,
        recommendation: 'Rename or merge with the duplicate record'
    }));
}
```

---

### 7. hardcoded_sys_id

**Type:** `hardcoded_sys_id`  
**Code:** `HARDCODED_SYSID`  
**Params:** `{"fields": "script,query"}` (optionnel)

```javascript
// Scan configuration scripts and record fields for 32-hex sys_ids
var regex = /[0-9a-f]{32}/ig;
var hits = [];
var recordName = item.values.name || item.values.title || 'Record';

// 1) Scan record fields (item.values) if fields provided
var fields = (params.fields || '').split(',').map(function(f){ return (f || '').trim(); }).filter(function(f){ return !!f; });
for (var i = 0; i < fields.length; i++) {
    var f = fields[i];
    var val = (item.values && item.values[f]) || '';
    if (typeof val !== 'string') continue;
    var matches = val.match(regex);
    if (matches && matches.length > 0) {
        hits.push({ field: f, matches: matches, count: matches.length });
    }
}

// 2) Scan item config scripts/queries
var sources = [
    { field: 'query_script', value: item.query_script },
    { field: 'query_value', value: item.query_value },
    { field: 'metadata', value: item.metadata },
    { field: 'script', value: item.values && item.values.script }
];
for (var j = 0; j < sources.length; j++) {
    var src = sources[j];
    if (!src.value || typeof src.value !== 'string') continue;
    var m = src.value.match(regex);
    if (m && m.length > 0) {
        hits.push({ field: src.field, matches: m, count: m.length });
    }
}

if (hits.length > 0) {
    var totalSysIds = 0;
    var fieldsList = [];
    hits.forEach(function(h) {
        totalSysIds += h.count;
        fieldsList.push(h.field + ' (' + h.count + ')');
    });
    
    var message = 'Hardcoded sys_id(s) detected in "' + recordName + '": ' + totalSysIds + ' occurrence(s) in fields [' + fieldsList.join(', ') + ']. Replace with dynamic queries or GlideRecord lookups.';
    
    issues.push(issue(rule, message, {
        hits: hits,
        total_sys_ids: totalSysIds,
        fields: fieldsList,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: recordName,
        recommendation: 'Replace hardcoded sys_ids with dynamic queries using name or other unique fields'
    }));
}
```

---

### 8. br_density

**Type:** `br_density`  
**Code:** `BR_TOO_MANY`  
**Params:** `{"threshold": 30}`

```javascript
var count = context && context.totalCount;
var threshold = params.threshold || 0;

// Aggregate rule: only fire once per dataset, not per item
if (!context) context = {};
if (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};
var key = 'br_density_' + rule.code;

if (!context._aggregateIssuesFired[key] && threshold && count > threshold) {
    context._aggregateIssuesFired[key] = true;
    
    // Get the table name from the first item
    var tableName = item.table || 'sys_script';
    var tableValue = item.values && item.values.collection ? item.values.collection : 'unknown';
    
    var message = 'Too many Business Rules (' + count + ' > ' + threshold + ') - Table: ' + tableValue + '. Click to view all active Business Rules and consider consolidating to improve performance.';
    
    issues.push(issue(rule, message, {
        count: count,
        threshold: threshold,
        table: tableValue,
        record_table: 'sys_script',
        record_filter: 'collection=' + tableValue + '^active=true',
        record_name: 'View ' + count + ' Business Rules'
    }));
}
```

---

### 9. field_check

**Type:** `field_check`  
**Code:** Custom  
**Params:** `{"field": "active", "operator": "equals", "expected": "false", "message_template": "..."}`

**Opérateurs supportés:** `equals`, `not_equals`, `contains`, `not_contains`, `empty`, `not_empty`, `regex`, `gt`, `lt`, `gte`, `lte`

```javascript
var field = params.field;
if (!field) return;

var value = item.values && item.values[field];
var operator = params.operator || 'equals';
var expected = params.expected;
var recordName = item.values.name || item.values.title || 'Record';

var condition = false;
var actualStr = String(value || '');
var expectedStr = String(expected || '');

switch(operator) {
    case 'equals':
        condition = actualStr === expectedStr;
        break;
    case 'not_equals':
        condition = actualStr !== expectedStr;
        break;
    case 'contains':
        condition = actualStr.indexOf(expectedStr) !== -1;
        break;
    case 'not_contains':
        condition = actualStr.indexOf(expectedStr) === -1;
        break;
    case 'empty':
        condition = !value || value === '';
        break;
    case 'not_empty':
        condition = value && value !== '';
        break;
    case 'regex':
        try {
            var regex = new RegExp(expectedStr);
            condition = regex.test(actualStr);
        } catch(e) {
            gs.warn('[field_check] Invalid regex: ' + expectedStr);
            return;
        }
        break;
    case 'gt':
        condition = parseFloat(value) > parseFloat(expected);
        break;
    case 'lt':
        condition = parseFloat(value) < parseFloat(expected);
        break;
    case 'gte':
        condition = parseFloat(value) >= parseFloat(expected);
        break;
    case 'lte':
        condition = parseFloat(value) <= parseFloat(expected);
        break;
    default:
        gs.warn('[field_check] Unknown operator: ' + operator);
        return;
}

if (condition) {
    var message = params.message_template || 
        'Field "' + field + '" ' + operator + ' "' + expectedStr + '" in "' + recordName + '"';
    
    issues.push(issue(rule, message, {
        field: field,
        operator: operator,
        expected: expectedStr,
        actual: actualStr,
        record_table: item.table,
        record_sys_id: item.sys_id,
        record_name: recordName
    }));
}
```

---

### 10. pattern_scan

**Type:** `pattern_scan`  
**Code:** Custom  
**Params:** `{"fields": "script,query", "pattern": "eval\\(", "message_template": "..."}`

```javascript
if (!params.pattern) return;

var pattern = params.pattern;
var fields = (params.fields || '').split(',').map(function(f){ return (f || '').trim(); }).filter(function(f){ return !!f; });
var recordName = item.values.name || item.values.title || 'Record';

try {
    var regex = new RegExp(pattern, 'i');
    
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var value = item.values && item.values[field];
        if (!value || typeof value !== 'string') continue;
        
        var match = value.match(regex);
        if (match) {
            var message = params.message_template || 
                'Pattern "' + pattern + '" found in field "' + field + '" of "' + recordName + '"';
            
            issues.push(issue(rule, message, {
                field: field,
                pattern: pattern,
                match: match[0],
                record_table: item.table,
                record_sys_id: item.sys_id,
                record_name: recordName
            }));
            
            // Stop after first match
            return;
        }
    }
} catch(e) {
    gs.warn('[pattern_scan] Invalid regex: ' + pattern + ' - ' + e.message);
}
```

---

### 11. aggregate_metric

**Type:** `aggregate_metric`  
**Code:** Custom  
**Params:** `{"metric": "count", "threshold": 100, "operator": "gt", "message_template": "..."}`

**Métriques supportées:** `count` (sum/avg/max/min nécessitent support moteur)

```javascript
var metric = params.metric || 'count';
var threshold = params.threshold;
var operator = params.operator || 'gt';

// Aggregate rule: only fire once per dataset
if (!context) context = {};
if (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};
var key = 'aggregate_metric_' + rule.code;
if (context._aggregateIssuesFired[key]) return;

var value = 0;
var count = context && context.totalCount || 0;

if (metric === 'count') {
    value = count;
} else {
    // Pour sum/avg/max/min, nécessite amélioration du moteur
    gs.warn('[aggregate_metric] Metrics other than count require engine support');
    return;
}

var condition = false;
switch(operator) {
    case 'gt': condition = value > threshold; break;
    case 'lt': condition = value < threshold; break;
    case 'gte': condition = value >= threshold; break;
    case 'lte': condition = value <= threshold; break;
    case 'equals': condition = value === threshold; break;
}

if (condition) {
    context._aggregateIssuesFired[key] = true;
    
    var message = params.message_template || 
        metric.toUpperCase() + ' ' + operator + ' threshold (' + value + ' ' + operator + ' ' + threshold + ')';
    
    issues.push(issue(rule, message, {
        metric: metric,
        value: value,
        threshold: threshold,
        operator: operator
    }));
}
```

---

## HANDLERS LEGACY

### 12. missing_acl

**Type:** `missing_acl`  
**Code:** `MISSING_ACL`  
**Params:** `{}`

```javascript
if (item.values && item.values.missing_acl === 'true') {
    issues.push(issue(rule, 'Missing ACL on table/resource', {}));
}
```

---

### 13. acl_issue

**Type:** `acl_issue`  
**Code:** `ACL_TOO_WIDE`  
**Params:** `{}`

```javascript
if (item.values && item.values.acl_too_wide === 'true') {
    issues.push(issue(rule, 'ACL too permissive', {}));
}
```

---

### 14. index_needed

**Type:** `index_needed`  
**Code:** `INDEX_NEEDED`  
**Params:** `{"field": "assigned_to"}`

```javascript
var field = params.field || 'unknown';
if (item.values && item.values.index_needed === 'true') {
    issues.push(issue(rule, 'Index needed on ' + field, { field: field }));
}
```

---

### 15. risky_field

**Type:** `risky_field`  
**Code:** `RISKY_FIELD`  
**Params:** `{}`

```javascript
if (item.values && item.values.risky_field === 'true') {
    issues.push(issue(rule, 'Risky field content', {}));
}
```

---

### 16. public_endpoint

**Type:** `public_endpoint`  
**Code:** `PUBLIC_ENDPOINT`  
**Params:** `{}`

```javascript
if (item.values && item.values.public_endpoint === 'true') {
    issues.push(issue(rule, 'Public endpoint without auth/rate limit', {}));
}
```

---

### 17. public_access

**Type:** `public_access`  
**Code:** `PUBLIC_ACCESS`  
**Params:** `{}`

```javascript
if (item.values && item.values.public_access === 'true') {
    issues.push(issue(rule, 'Guest/public access detected', {}));
}
```

---

### 18. br_heavy

**Type:** `br_heavy`  
**Code:** `BR_HEAVY`  
**Params:** `{}`

```javascript
if (item.values && item.values.heavy_br === 'true') {
    issues.push(issue(rule, 'Heavy Business Rule', {}));
}
```

---

### 19. cs_heavy

**Type:** `cs_heavy`  
**Code:** `CS_HEAVY`  
**Params:** `{}`

```javascript
if (item.values && item.values.heavy_cs === 'true') {
    issues.push(issue(rule, 'Heavy Client Script', {}));
}
```

---

### 20. ui_action

**Type:** `ui_action`  
**Code:** `UI_ACTION_SERVER`  
**Params:** `{}`

```javascript
if (item.values && item.values.ui_action_server === 'true') {
    issues.push(issue(rule, 'Server UI Action without need', {}));
}
```

---

### 21. job_error

**Type:** `job_error`  
**Code:** `JOB_ERROR`  
**Params:** `{}`

```javascript
if (item.values && item.values.job_error === 'true') {
    issues.push(issue(rule, 'Scheduled job errors', {}));
}
```

---

### 22. job_inactive

**Type:** `job_inactive`  
**Code:** `JOB_INACTIVE`  
**Params:** `{}`

```javascript
if (item.values && item.values.job_inactive === 'true') {
    issues.push(issue(rule, 'Scheduled job inactive', {}));
}
```

---

### 23. flow_error

**Type:** `flow_error`  
**Code:** `FLOW_ERROR`  
**Params:** `{}`

```javascript
if (item.values && item.values.flow_error === 'true') {
    issues.push(issue(rule, 'Flow in error', {}));
}
```

---

### 24. flow_config

**Type:** `flow_config`  
**Code:** `FLOW_NO_TIMEOUT`  
**Params:** `{}`

```javascript
if (item.values && item.values.flow_no_timeout === 'true') {
    issues.push(issue(rule, 'Flow missing timeout/retry', {}));
}
```

---

### 25. notification

**Type:** `notification`  
**Code:** `NOTIFICATION_SPAM`  
**Params:** `{}`

```javascript
if (item.values && item.values.notification_spam === 'true') {
    issues.push(issue(rule, 'Notification spam risk', {}));
}
```

---

### 26. integration_error

**Type:** `integration_error`  
**Code:** `INTEGRATION_ERROR`  
**Params:** `{}`

```javascript
if (item.values && item.values.integration_error === 'true') {
    issues.push(issue(rule, 'Integration errors detected', {}));
}
```

---

### 27. integration_config

**Type:** `integration_config`  
**Code:** `INTEGRATION_NO_RETRY`  
**Params:** `{}`

```javascript
if (item.values && item.values.integration_no_retry === 'true') {
    issues.push(issue(rule, 'Integration missing retry/backoff', {}));
}
```

---

### 28. widget_perf

**Type:** `widget_perf`  
**Code:** `WIDGET_NO_CACHE`  
**Params:** `{}`

```javascript
if (item.values && item.values.widget_no_cache === 'true') {
    issues.push(issue(rule, 'Widget/portal without cache/pagination', {}));
}
```

---

### 29. query_scan

**Type:** `query_scan`  
**Code:** `FULL_TABLE_SCAN`  
**Params:** `{}`

```javascript
if (item.values && item.values.full_table_scan === 'true') {
    issues.push(issue(rule, 'Full table scan detected', {}));
}
```

---

### 30. script_weight

**Type:** `script_weight`  
**Code:** `HEAVY_SCRIPT`  
**Params:** `{}`

```javascript
if (item.values && item.values.heavy_script === 'true') {
    issues.push(issue(rule, 'Heavy server script', {}));
}
```

---

### 31. audit

**Type:** `audit`  
**Code:** `AUDIT_DISABLED`  
**Params:** `{}`

```javascript
if (item.values && item.values.audit_disabled === 'true') {
    issues.push(issue(rule, 'Audit disabled on sensitive table', {}));
}
```

---

### 32. security

**Type:** `security`  
**Code:** `SECURITY_RISK`  
**Params:** `{}`

```javascript
if (item.values && item.values.security_risk === 'true') {
    issues.push(issue(rule, 'Security risk detected', {}));
}
```

---

### 33. catalog

**Type:** `catalog`  
**Code:** `CATALOG_RISK`  
**Params:** `{}`

```javascript
if (item.values && item.values.catalog_risk === 'true') {
    issues.push(issue(rule, 'Catalog item risk', {}));
}
```

---

### 34. mail_config

**Type:** `mail_config`  
**Code:** `MAIL_NO_RESTRICTION`  
**Params:** `{}`

```javascript
if (item.values && item.values.mail_no_restriction === 'true') {
    issues.push(issue(rule, 'Mail not restricted', {}));
}
```

---

### 35. observability

**Type:** `observability`  
**Code:** `NO_METRICS`  
**Params:** `{}`

```javascript
if (item.values && item.values.no_metrics === 'true') {
    issues.push(issue(rule, 'No metrics/logs on critical component', {}));
}
```

---

## 🎯 Migration Steps

### 1. Mettre à jour le Script Include

Remplacer le contenu de `FHARuleEvaluator` par la nouvelle version simplifiée (fichier `NEW_FHARuleEvaluator.xml`).

### 2. Mettre à jour chaque règle dans la table

Pour chaque règle dans `x_1310794_founda_0_issue_rules` :
1. Ouvrir la règle
2. Copier le script correspondant depuis ce document
3. Coller dans le champ `script`
4. Sauvegarder

### 3. Tester

Lancer une analyse et vérifier que les issues sont correctement détectées.

---

## ✅ Avantages de cette Architecture

1. **✅ Centralisation** : Toutes les règles au même endroit (la table)
2. **✅ Flexibilité** : Modification des règles sans redéploiement
3. **✅ Maintenabilité** : Code plus léger et plus lisible
4. **✅ Extensibilité** : Ajout de nouvelles règles facilité
5. **✅ Versioning** : Historique des changements via sys_mod_count
6. **✅ Testabilité** : Tests unitaires plus simples

---

**Version:** 1.0  
**Date:** 2026-01-17  
**Auteur:** Wilfried Waret
