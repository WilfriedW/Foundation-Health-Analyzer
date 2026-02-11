# Guide: Verification Items et Issue Rules

## 📋 Table des matières
1. [Structure des VI et Rules](#structure)
2. [VI Techniques (Code/Configuration)](#vi-techniques)
3. [VI Qualité des Données](#vi-donnees)
4. [Issue Rules par catégorie](#rules)
5. [Exemples de scripts complets](#exemples)

---

## 1. Structure des VI et Rules {#structure}

### Verification Item (VI)
```javascript
{
  name: "Client Scripts Analysis",
  category: "automation",           // automation, integration, security, quality, performance
  table: "sys_script_client",       // Table à analyser
  query_value: "active=true",       // Filtre GlideRecord
  issue_rules: ["RULE001", "RULE002"], // Liste de sys_id de rules
  template: "<template_sys_id>",
  active: true
}
```

### Issue Rule
```javascript
{
  name: "GlideRecord in Client Script",
  code: "CS_GLIDERECORD",          // Code unique
  description: "Détecte l'utilisation de GlideRecord dans les Client Scripts",
  severity: "high",                 // critical, high, medium, low
  type: "anti_pattern",             // anti_pattern, best_practice, security, performance
  script: "function(item, context, issues) {...}", // Script de détection
  params: JSON.stringify({          // Paramètres
    patterns: ["new GlideRecord", "gr.query()"]
  }),
  verification_items: ["<VI_sys_id>"],
  active: true
}
```

---

## 2. VI Techniques (Code/Configuration) {#vi-techniques}

### 2.1 Client Scripts 🖥️

#### VI 1: Client Scripts Anti-Patterns
```javascript
{
  name: "Client Scripts - Anti-Patterns Detection",
  category: "automation",
  table: "sys_script_client",
  query_value: "active=true",
  description: "Détecte les anti-patterns dans les Client Scripts",
  issue_rules: [
    "CS_GLIDERECORD",
    "CS_SYNCHRONOUS_AJAX",
    "CS_HARDCODED_SYSID",
    "CS_LARGE_SCRIPT",
    "CS_NO_CONDITION"
  ]
}
```

#### VI 2: Client Scripts Performance
```javascript
{
  name: "Client Scripts - Performance Issues",
  category: "performance",
  table: "sys_script_client",
  query_value: "active=true^type=onChange",
  description: "Détecte les problèmes de performance dans les onChange",
  issue_rules: [
    "CS_ONCHANGE_NO_OLDVALUE",
    "CS_MULTIPLE_ONCHANGE_SAME_FIELD",
    "CS_COMPLEX_ONCHANGE"
  ]
}
```

### 2.2 Business Rules ⚙️

#### VI 3: Business Rules Anti-Patterns
```javascript
{
  name: "Business Rules - Code Quality",
  category: "automation",
  table: "sys_script",
  query_value: "active=true",
  description: "Analyse la qualité du code des Business Rules",
  issue_rules: [
    "BR_BEFORE_CURRENT_UPDATE",
    "BR_ASYNC_WITH_CURRENT",
    "BR_NESTED_GLIDERECORD",
    "BR_NO_CONDITION",
    "BR_TOO_MANY_QUERIES"
  ]
}
```

#### VI 4: Business Rules Performance
```javascript
{
  name: "Business Rules - Performance",
  category: "performance",
  table: "sys_script",
  query_value: "active=true^when=before",
  description: "Détecte les BR lentes qui impactent les transactions",
  issue_rules: [
    "BR_EXPENSIVE_BEFORE",
    "BR_LARGE_SCRIPT",
    "BR_MULTIPLE_UPDATES"
  ]
}
```

### 2.3 UI Policies 🎨

#### VI 5: UI Policies Issues
```javascript
{
  name: "UI Policies - Configuration",
  category: "automation",
  table: "sys_ui_policy",
  query_value: "active=true",
  description: "Vérifie la configuration des UI Policies",
  issue_rules: [
    "UIP_NO_ACTIONS",
    "UIP_OVERLAPPING_CONDITIONS",
    "UIP_REDUNDANT_SCRIPTS"
  ]
}
```

### 2.4 ACLs 🔒

#### VI 6: ACL Security
```javascript
{
  name: "Access Control - Security Review",
  category: "security",
  table: "sys_security_acl",
  query_value: "active=true",
  description: "Audit de sécurité des ACLs",
  issue_rules: [
    "ACL_SCRIPT_ONLY",
    "ACL_TOO_PERMISSIVE",
    "ACL_NO_CONDITION",
    "ACL_HARDCODED_USER"
  ]
}
```

### 2.5 Workflows & Flows 🔄

#### VI 7: Workflow Efficiency
```javascript
{
  name: "Workflows - Efficiency Check",
  category: "automation",
  table: "wf_workflow",
  query_value: "published=true",
  description: "Analyse l'efficacité des workflows",
  issue_rules: [
    "WF_TOO_MANY_ACTIVITIES",
    "WF_NO_ERROR_HANDLING",
    "WF_DEPRECATED_ACTIVITIES"
  ]
}
```

### 2.6 Scheduled Jobs ⏰

#### VI 8: Scheduled Jobs Performance
```javascript
{
  name: "Scheduled Jobs - Performance",
  category: "performance",
  table: "sysauto_script",
  query_value: "active=true",
  description: "Vérifie les performances des jobs planifiés",
  issue_rules: [
    "JOB_NO_LIMIT",
    "JOB_PEAK_HOURS",
    "JOB_LONG_RUNNING"
  ]
}
```

---

## 3. VI Qualité des Données {#vi-donnees}

### 3.1 Données Manquantes 📊

#### VI 9: Mandatory Fields Not Filled
```javascript
{
  name: "Data Quality - Missing Mandatory Fields",
  category: "quality",
  table: "incident",  // Table dynamique
  query_value: "active=true",
  description: "Détecte les champs obligatoires vides malgré les règles",
  issue_rules: [
    "DATA_MANDATORY_EMPTY",
    "DATA_MANDATORY_DEFAULT"
  ]
}
```

#### VI 10: Important Fields Empty
```javascript
{
  name: "Data Quality - Important Fields",
  category: "quality",
  table: "cmdb_ci",
  query_value: "install_status=1",  // Installed
  description: "Vérifie que les champs importants sont renseignés",
  issue_rules: [
    "DATA_CI_NO_OWNER",
    "DATA_CI_NO_LOCATION",
    "DATA_CI_NO_CATEGORY"
  ]
}
```

### 3.2 Cohérence des Données 🔗

#### VI 11: Data Consistency
```javascript
{
  name: "Data Quality - Consistency Checks",
  category: "quality",
  table: "incident",
  query_value: "active=true",
  description: "Vérifie la cohérence des données",
  issue_rules: [
    "DATA_INCONSISTENT_DATES",
    "DATA_INVALID_STATE_FLOW",
    "DATA_ORPHANED_REFERENCES"
  ]
}
```

### 3.3 Duplicatas 👥

#### VI 12: Duplicate Detection
```javascript
{
  name: "Data Quality - Duplicate Records",
  category: "quality",
  table: "sys_user",
  query_value: "active=true",
  description: "Détecte les doublons potentiels",
  issue_rules: [
    "DATA_DUPLICATE_EMAIL",
    "DATA_DUPLICATE_NAME",
    "DATA_SIMILAR_RECORDS"
  ]
}
```

### 3.4 Données Obsolètes 🗑️

#### VI 13: Stale Data
```javascript
{
  name: "Data Quality - Stale Records",
  category: "quality",
  table: "incident",
  query_value: "",
  description: "Détecte les données obsolètes ou non mises à jour",
  issue_rules: [
    "DATA_NEVER_UPDATED",
    "DATA_OLD_OPEN_RECORDS",
    "DATA_ZOMBIE_RECORDS"
  ]
}
```

### 3.5 Intégrité Référentielle 🔗

#### VI 14: Reference Integrity
```javascript
{
  name: "Data Quality - Reference Integrity",
  category: "quality",
  table: "task",
  query_value: "",
  description: "Vérifie l'intégrité des références",
  issue_rules: [
    "DATA_BROKEN_REFERENCE",
    "DATA_CIRCULAR_REFERENCE",
    "DATA_INVALID_CASCADE"
  ]
}
```

---

## 4. Issue Rules par catégorie {#rules}

### 4.1 Client Scripts Rules 🖥️

#### RULE: CS_GLIDERECORD
**Détecte l'utilisation de GlideRecord dans les Client Scripts**

```javascript
/**
 * RULE: GlideRecord in Client Script
 * Severity: HIGH
 * Code: CS_GLIDERECORD
 */
(function executeRule(item, context, issues) {
    var script = item.values.script || '';

    // Patterns à détecter
    var patterns = [
        /new\s+GlideRecord\s*\(/gi,
        /gr\.query\s*\(/gi,
        /\.addQuery\s*\(/gi
    ];

    var findings = [];
    patterns.forEach(function(pattern) {
        var matches = script.match(pattern);
        if (matches) {
            findings.push({
                pattern: pattern.toString(),
                occurrences: matches.length
            });
        }
    });

    if (findings.length > 0) {
        issues.push({
            code: rule.code,
            message: 'GlideRecord detected in Client Script "' + item.values.name +
                     '". Client Scripts should use GlideAjax for server calls.',
            severity: 'high',
            record: item.sys_id,
            record_table: 'sys_script_client',
            details: {
                script_name: item.values.name,
                script_type: item.values.type,
                findings: findings,
                recommendation: 'Replace GlideRecord calls with GlideAjax to avoid performance issues'
            }
        });
    }
})(item, context, issues);
```

**Params:**
```json
{
  "patterns": ["new GlideRecord", "gr.query()", ".addQuery("]
}
```

#### RULE: CS_SYNCHRONOUS_AJAX
**Détecte les appels AJAX synchrones**

```javascript
/**
 * RULE: Synchronous AJAX in Client Script
 * Severity: HIGH
 * Code: CS_SYNCHRONOUS_AJAX
 */
(function executeRule(item, context, issues) {
    var script = item.values.script || '';

    // Recherche de getXMLWait
    if (script.match(/getXMLWait\s*\(/i)) {
        issues.push({
            code: rule.code,
            message: 'Synchronous AJAX call (getXMLWait) detected in "' + item.values.name +
                     '". This blocks the browser and degrades user experience.',
            severity: 'high',
            record: item.sys_id,
            record_table: 'sys_script_client',
            details: {
                script_name: item.values.name,
                method: 'getXMLWait',
                recommendation: 'Replace getXMLWait with getXML (asynchronous) and use callback functions'
            }
        });
    }
})(item, context, issues);
```

### 4.2 Business Rules Rules ⚙️

#### RULE: BR_BEFORE_CURRENT_UPDATE
**Détecte current.update() dans les BR before**

```javascript
/**
 * RULE: current.update() in before Business Rule
 * Severity: CRITICAL
 * Code: BR_BEFORE_CURRENT_UPDATE
 */
(function executeRule(item, context, issues) {
    var script = item.values.script || '';
    var when = item.values.when || '';

    if (when === 'before' && script.match(/current\.update\s*\(/i)) {
        issues.push({
            code: rule.code,
            message: 'current.update() called in before Business Rule "' + item.values.name +
                     '". This causes infinite loops and database locks.',
            severity: 'critical',
            record: item.sys_id,
            record_table: 'sys_script',
            details: {
                rule_name: item.values.name,
                when: when,
                table: item.values.collection,
                recommendation: 'Remove current.update(). Changes are auto-saved in before rules. Use setAbortAction() if needed.'
            }
        });
    }
})(item, context, issues);
```

#### RULE: BR_NESTED_GLIDERECORD
**Détecte les GlideRecord imbriqués**

```javascript
/**
 * RULE: Nested GlideRecord queries
 * Severity: MEDIUM
 * Code: BR_NESTED_GLIDERECORD
 */
(function executeRule(item, context, issues) {
    var script = item.values.script || '';

    // Recherche de GlideRecord dans des while loops
    var pattern = /while\s*\([^)]*\.next\s*\(\)\s*\)\s*{[^}]*new\s+GlideRecord/gi;

    if (script.match(pattern)) {
        issues.push({
            code: rule.code,
            message: 'Nested GlideRecord queries detected in "' + item.values.name +
                     '". This creates N+1 query problems.',
            severity: 'medium',
            record: item.sys_id,
            record_table: 'sys_script',
            details: {
                rule_name: item.values.name,
                recommendation: 'Refactor to use JOINs, aggregate queries, or cache results'
            }
        });
    }
})(item, context, issues);
```

### 4.3 Data Quality Rules 📊

#### RULE: DATA_MANDATORY_EMPTY
**Détecte les champs obligatoires vides**

```javascript
/**
 * RULE: Mandatory field empty
 * Severity: MEDIUM
 * Code: DATA_MANDATORY_EMPTY
 * Params: { "fields": "priority,category,assigned_to" }
 */
(function executeRule(item, context, issues) {
    if (!params || !params.fields) {
        gs.warn('[Rule:DATA_MANDATORY_EMPTY] No fields specified in params');
        return;
    }

    var mandatoryFields = params.fields.split(',').map(function(f) {
        return f.trim();
    });

    var emptyFields = [];

    mandatoryFields.forEach(function(fieldName) {
        var value = item.values[fieldName];
        if (!value || value === '' || value === 'NULL') {
            emptyFields.push(fieldName);
        }
    });

    if (emptyFields.length > 0) {
        issues.push({
            code: rule.code,
            message: 'Record "' + item.values.number + '" has empty mandatory fields: ' +
                     emptyFields.join(', '),
            severity: 'medium',
            record: item.sys_id,
            record_table: item.table,
            details: {
                record_number: item.values.number,
                empty_fields: emptyFields,
                total_empty: emptyFields.length,
                recommendation: 'Update records to fill mandatory fields or adjust field configuration'
            }
        });
    }
})(item, context, issues);
```

#### RULE: DATA_INCONSISTENT_DATES
**Détecte les incohérences de dates**

```javascript
/**
 * RULE: Inconsistent dates
 * Severity: MEDIUM
 * Code: DATA_INCONSISTENT_DATES
 * Params: { "start_field": "opened_at", "end_field": "closed_at" }
 */
(function executeRule(item, context, issues) {
    if (!params || !params.start_field || !params.end_field) return;

    var startDate = item.values[params.start_field];
    var endDate = item.values[params.end_field];

    if (startDate && endDate) {
        var start = new GlideDateTime(startDate);
        var end = new GlideDateTime(endDate);

        // Vérifie que la date de fin est après la date de début
        if (end.before(start)) {
            issues.push({
                code: rule.code,
                message: 'Record "' + item.values.number + '" has inconsistent dates: ' +
                         params.end_field + ' (' + endDate + ') is before ' +
                         params.start_field + ' (' + startDate + ')',
                severity: 'medium',
                record: item.sys_id,
                record_table: item.table,
                details: {
                    record_number: item.values.number,
                    start_field: params.start_field,
                    start_date: startDate,
                    end_field: params.end_field,
                    end_date: endDate,
                    recommendation: 'Correct the date fields to reflect proper chronology'
                }
            });
        }
    }
})(item, context, issues);
```

#### RULE: DATA_DUPLICATE_EMAIL
**Détecte les emails en double**

```javascript
/**
 * RULE: Duplicate email addresses
 * Severity: HIGH
 * Code: DATA_DUPLICATE_EMAIL
 */
(function executeRule(item, context, issues) {
    var email = item.values.email;

    if (!email || email === '') return;

    // Compte les autres enregistrements avec le même email
    var gr = new GlideRecord(item.table);
    gr.addQuery('email', email);
    gr.addQuery('sys_id', '!=', item.sys_id);
    gr.addActiveQuery();
    gr.query();

    var duplicates = [];
    while (gr.next()) {
        duplicates.push({
            sys_id: gr.getUniqueValue(),
            name: gr.getValue('name') || gr.getValue('user_name'),
            email: gr.getValue('email')
        });
    }

    if (duplicates.length > 0) {
        issues.push({
            code: rule.code,
            message: 'Email "' + email + '" is used by ' + (duplicates.length + 1) + ' records',
            severity: 'high',
            record: item.sys_id,
            record_table: item.table,
            details: {
                email: email,
                duplicate_count: duplicates.length,
                duplicates: duplicates,
                recommendation: 'Merge duplicate records or update email addresses to be unique'
            }
        });
    }
})(item, context, issues);
```

---

## 5. Exemples de scripts complets {#exemples}

### Script de création de VI + Rules

```javascript
/**
 * Script pour créer un VI complet avec ses rules
 * À exécuter dans Background Scripts
 */

// 1. Créer les Issue Rules
var rules = [
    {
        name: 'GlideRecord in Client Script',
        code: 'CS_GLIDERECORD',
        description: 'Détecte l\'utilisation de GlideRecord dans les Client Scripts',
        severity: 'high',
        type: 'anti_pattern',
        active: true,
        script: "/* Script de la règle CS_GLIDERECORD */",
        params: JSON.stringify({
            patterns: ['new GlideRecord', 'gr.query()']
        })
    },
    {
        name: 'Synchronous AJAX',
        code: 'CS_SYNCHRONOUS_AJAX',
        description: 'Détecte les appels AJAX synchrones (getXMLWait)',
        severity: 'high',
        type: 'performance',
        active: true,
        script: "/* Script de la règle CS_SYNCHRONOUS_AJAX */",
        params: ''
    },
    {
        name: 'Hardcoded sys_id in script',
        code: 'CS_HARDCODED_SYSID',
        description: 'Détecte les sys_id hardcodés dans le code',
        severity: 'high',
        type: 'anti_pattern',
        active: true,
        script: "/* Script existant hardcoded_sysid */",
        params: JSON.stringify({
            fields: 'script'
        })
    }
];

var ruleSysIds = [];

rules.forEach(function(ruleData) {
    var gr = new GlideRecord('x_1310794_founda_0_issue_rules');

    // Vérifier si la règle existe déjà
    gr.addQuery('code', ruleData.code);
    gr.query();

    if (!gr.next()) {
        gr.initialize();
    }

    // Mettre à jour les champs
    gr.setValue('name', ruleData.name);
    gr.setValue('code', ruleData.code);
    gr.setValue('description', ruleData.description);
    gr.setValue('severity', ruleData.severity);
    gr.setValue('type', ruleData.type);
    gr.setValue('active', ruleData.active);
    gr.setValue('script', ruleData.script);
    gr.setValue('params', ruleData.params);

    var sysId = gr.update() || gr.insert();
    ruleSysIds.push(sysId);

    gs.info('Created/Updated rule: ' + ruleData.code + ' (' + sysId + ')');
});

// 2. Créer le Verification Item
var vi = new GlideRecord('x_1310794_founda_0_verification_items');
vi.initialize();
vi.setValue('name', 'Client Scripts - Anti-Patterns');
vi.setValue('category', 'automation');
vi.setValue('table', 'sys_script_client');
vi.setValue('query_value', 'active=true');
vi.setValue('active', true);

// Associer les rules (glide_list)
vi.setValue('issue_rules', ruleSysIds.join(','));

var viSysId = vi.insert();
gs.info('Created VI: ' + viSysId);

// 3. Mettre à jour les rules pour référencer le VI
ruleSysIds.forEach(function(ruleSysId) {
    var ruleGr = new GlideRecord('x_1310794_founda_0_issue_rules');
    if (ruleGr.get(ruleSysId)) {
        var existingVIs = ruleGr.getValue('verification_items') || '';
        var viList = existingVIs ? existingVIs.split(',') : [];

        if (viList.indexOf(viSysId) === -1) {
            viList.push(viSysId);
            ruleGr.setValue('verification_items', viList.join(','));
            ruleGr.update();
        }
    }
});

gs.info('===== CREATION COMPLETE =====');
gs.info('VI sys_id: ' + viSysId);
gs.info('Rules: ' + ruleSysIds.join(', '));
```

---

## 📚 Catégories recommandées

### Techniques (Code/Config)
- ✅ Client Scripts
- ✅ Business Rules
- ✅ UI Policies
- ✅ ACLs
- ✅ Workflows
- ✅ Scheduled Jobs
- ⬜ Script Includes
- ⬜ UI Actions
- ⬜ Data Policies
- ⬜ Transform Maps

### Données (Quality)
- ✅ Mandatory Fields
- ✅ Data Consistency
- ✅ Duplicates
- ✅ Stale Data
- ✅ Reference Integrity
- ⬜ Data Format Validation
- ⬜ Business Logic Violations

---

## 🎯 Prochaines étapes

1. **Choisir un thème** (ex: Client Scripts)
2. **Définir les rules** à implémenter
3. **Écrire les scripts** de détection
4. **Tester** sur une table de dev
5. **Créer le VI** et associer les rules
6. **Valider** les résultats
7. **Itérer** pour les autres thèmes

Quelle catégorie veux-tu commencer à implémenter en premier ? 🚀
