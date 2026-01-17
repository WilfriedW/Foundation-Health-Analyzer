# Architecture des Handlers v2.0

## 🏗️ Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                  Foundation Health Analyzer                      │
│                        Handlers v2.0                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ Verification    │  ← Définit QUOI analyser
│ Item            │
│                 │
│ - Table         │
│ - Query         │
│ - Fields        │
│ - Issue Rules   │────┐
└─────────────────┘    │
                       │
                       ↓
┌─────────────────┐  ┌─────────────────┐
│ FHAnalysis      │  │ Issue Rules     │  ← Définit COMMENT détecter
│ Engine          │  │                 │
│                 │  │ - Name/Code     │
│ - Run query     │  │ - Type/Handler  │
│ - Collect data  │  │ - Params        │
│ - Apply rules   │  │ - Script        │
│ - Aggregate     │  │ - Severity      │
└────────┬────────┘  └────────┬────────┘
         │                    │
         │    ┌───────────────┘
         │    │
         ↓    ↓
┌─────────────────┐
│ FHARuleEvaluator│  ← Exécute les handlers
│                 │
│ evaluate()      │
│  ├─ _runScript()│  ← 1. Script personnalisé (si présent)
│  └─ handler()   │  ← 2. Handler built-in (si présent)
│                 │
│ Handlers:       │
│  ├─ CORE (11)   │  ← Génériques, réutilisables
│  ├─ NEW (3)     │  ← Nouveaux v2.0
│  └─ LEGACY (18) │  ← Anciens (à migrer)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Issues          │  ← Résultats
│                 │
│ - Code          │
│ - Message       │
│ - Severity      │
│ - Details       │
│   ├─ Links      │
│   ├─ Metrics    │
│   └─ Recommendations
└─────────────────┘
```

---

## 🔄 Flux d'exécution

### 1. Déclenchement de l'analyse

```
User Action
    ↓
[Create/Run Analysis]
    ↓
FHCheckTable
    ↓
FHAnalysisEngine.runVerification(config)
```

### 2. Collecte des données

```
FOR EACH Verification Item:
    ↓
[Build Query]
    ↓
[Execute Query] → GlideRecord
    ↓
[Collect Records] → result.data[]
    ↓
[Load Issue Rules] → rulesMap
```

### 3. Évaluation (pour chaque record)

```
FOR EACH Record in result.data:
    ↓
[Get Rules] → item._rules
    ↓
[Create Context]
    context = {
        totalCount: N,
        _dupsSeen: {},
        _aggregateIssuesFired: {}
    }
    ↓
[Call FHARuleEvaluator.evaluate(item, rules, context)]
    ↓
    FOR EACH Rule:
        ↓
        [1. Run Custom Script (if present)]
            ├─ Access: item, rule, params, context
            ├─ Populate: issues[]
            └─ Return: issues[]
        ↓
        [2. Run Built-in Handler (if present)]
            ├─ Check: _isApplicable()
            ├─ Execute: handler(item, rule, params, context)
            └─ Return: issues[]
        ↓
        [Aggregate issues]
    ↓
[Store in item.issues[]]
```

### 4. Agrégation finale

```
FOR EACH item.issues:
    ↓
[Extract Details]
    ├─ record_table (from details or item)
    ├─ record_sys_id (from details or item)
    ├─ record_filter (from details)
    └─ other metadata
    ↓
[Push to result.issues[]]
    ↓
[Return to User]
```

---

## 🧩 Composants

### FHAnalysisEngine

**Responsabilité :** Orchestration de l'analyse

**Méthodes clés :**
- `runVerification(config)` : Point d'entrée
- `_analyzeResults(result)` : Applique les règles
- `_loadIssueRules(items)` : Charge les règles

**Input :** Configuration (Verification Items)  
**Output :** Résultat avec issues

### FHARuleEvaluator

**Responsabilité :** Exécution des handlers et scripts

**Méthodes clés :**
- `evaluate(item, rules, context)` : Évalue un record
- `_runScript(script, ...)` : Exécute un script custom
- `_handlers{}` : Map de tous les handlers
- `_isApplicable(item, params)` : Filtre par table/catégorie

**Input :** Item, Rules, Context  
**Output :** Issues[]

### Handlers

**Responsabilité :** Logique de détection

**Types :**
1. **CORE (11)** : Génériques, gardés
   - count_threshold, br_density, inactive, system_created, missing_field, size_threshold, duplicate, hardcoded_sys_id, field_check, pattern_scan, aggregate_metric

2. **LEGACY (18)** : Booléens simples, à migrer
   - missing_acl, acl_issue, br_heavy, cs_heavy, etc.

**Input :** item, rule, params, context  
**Output :** issues[]

---

## 🎭 Pattern : Handler Individuel vs Agrégé

### Handler INDIVIDUEL (1 issue par record)

```javascript
// Exemple: inactive
inactive: function(item, rule, params) {
    if (item.values.active === 'false') {
        return [this._issue(rule, 'Inactive record', {...})];
    }
    return [];
}

// Appelé N fois (une fois par record)
// Retourne 0 ou 1 issue par record
```

**Cas d'usage :** Vérifier chaque record individuellement

### Handler AGRÉGÉ (1 issue pour tout le dataset)

```javascript
// Exemple: br_density
br_density: function(item, rule, params, context) {
    // Pattern d'agrégation
    if (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};
    var key = 'br_density_' + rule.code;
    if (context._aggregateIssuesFired[key]) return [];
    
    if (context.totalCount > params.threshold) {
        context._aggregateIssuesFired[key] = true;
        return [this._issue(rule, 'Too many...', {...})];
    }
    return [];
}

// Appelé N fois (une fois par record)
// Retourne 1 issue au PREMIER passage, puis 0 pour les suivants
```

**Cas d'usage :** Compter/agréger sur tout le dataset

---

## 🔌 Extension : Ajouter un nouveau handler

### Option 1 : Handler Built-in (code)

**Quand :** Logique générique réutilisable

**Étapes :**
1. Ouvrir `FHARuleEvaluator`
2. Ajouter dans `_handlers`:
```javascript
my_handler: function(item, rule, params, context) {
    // Logique
    if (condition) {
        return [this._issue(rule, message, details)];
    }
    return [];
}
```
3. Documenter dans `HANDLERS_REFERENCE.md`

### Option 2 : Script personnalisé (règle)

**Quand :** Logique métier spécifique

**Étapes :**
1. Créer une Issue Rule
2. Remplir le champ `script`:
```javascript
if (condition) {
    issues.push({
        code: rule.code,
        message: 'Message',
        severity: 'medium',
        details: {...}
    });
}
```
3. Documenter dans `SCRIPTS_LIBRARY.md` (optionnel)

**Recommandation :** Privilégier Option 2 pour la flexibilité

---

## 🔀 Combinaison Handler + Script

Une règle peut avoir **à la fois** un handler ET un script :

```
Rule:
  type: "size_threshold"
  params: {"field": "script", "max_len": 2000}
  script: "// Custom logic here"

Exécution:
  1. Script exécuté → issues[]
  2. Handler exécuté → issues[]
  3. Issues combinées → result
```

**Cas d'usage :** Handler pour vérification de base + Script pour cas spécifiques

---

## 📦 Objets de données

### Item (Record analysé)

```javascript
{
    sys_id: "abc123...",
    table: "sys_script",
    category: "automation",
    values: {
        name: "My Business Rule",
        active: "true",
        script: "function...",
        collection: "incident",
        // ... tous les champs récupérés
    },
    _rules: [/* règles à appliquer */],
    issues: [/* issues détectées */]
}
```

### Rule (Configuration)

```javascript
{
    name: "Too many Business Rules",
    code: "BR_TOO_MANY",
    type: "br_density",
    severity: "medium",
    params: {"threshold": 30},  // String JSON parsé
    script: "// Optional custom script"
}
```

### Context (Partagé entre tous les appels)

```javascript
{
    totalCount: 81,                    // Nombre total de records
    _dupsSeen: {                       // Map pour duplicate
        "key1": "sys_id1",
        "key2": "sys_id2"
    },
    _aggregateIssuesFired: {           // Map pour agrégation
        "br_density_BR_TOO_MANY": true
    }
}
```

### Issue (Résultat)

```javascript
{
    code: "BR_TOO_MANY",
    message: "Too many Business Rules (81 > 30) - Table: incident...",
    severity: "medium",
    details: {
        // Liens directs
        record_table: "sys_script",
        record_sys_id: "abc123...",
        record_name: "My BR",
        record_filter: "collection=incident^active=true",
        
        // Métriques
        count: 81,
        threshold: 30,
        
        // Recommandation
        recommendation: "Consolidate BRs..."
    }
}
```

---

## 🎨 Patterns de conception

### 1. Strategy Pattern (Handlers)

Chaque handler est une stratégie de détection indépendante.

```
Interface: handler(item, rule, params, context) → issues[]

Implémentations:
  - inactive
  - missing_field
  - field_check
  - ...
```

### 2. Context Object Pattern

Le contexte est passé à tous les handlers pour partager l'état.

```
context = {
    totalCount,
    _dupsSeen,
    _aggregateIssuesFired
}
```

### 3. Builder Pattern (Issues)

Les issues sont construites progressivement avec des détails.

```
this._issue(rule, message, {
    field: 'x',
    record_table: 'y',
    recommendation: 'z'
})
```

---

## 🔐 Sécurité et Performance

### Sécurité

- ✅ Scripts exécutés dans un contexte isolé (Function)
- ✅ Pas d'accès direct à `gs` ou autres APIs ServiceNow depuis les scripts
- ⚠️ Les scripts peuvent faire des GlideRecord queries (à limiter)

### Performance

**Optimisations :**
- Pattern d'agrégation évite N issues identiques
- Context partagé évite les recalculs
- Queries limitées dans les scripts (recommandation)

**Limites recommandées :**
- Max 1-2 queries par script
- Utiliser `setLimit()` sur les queries
- Éviter les boucles imbriquées

---

## 📈 Métriques et Monitoring

### Logs

```javascript
// Dans un handler/script
gs.info('[FHARuleEvaluator] Message');
gs.warn('[FHARuleEvaluator] Warning');
gs.error('[FHARuleEvaluator] Error: ' + e.message);
```

### Traçabilité

Chaque issue contient :
- `record_table`, `record_sys_id` : Lien direct vers l'enregistrement
- `details` : Contexte complet pour debug

---

## 🚀 Évolution future

### v2.1 (Q2 2026)

```
┌─────────────────┐
│ New Handlers    │
│                 │
│ - cs_density    │  ← Client Scripts density
│ - flow_density  │  ← Flows density
│ - field_aggregate│ ← sum/avg/max/min
└─────────────────┘
```

### v3.0 (Q3 2026)

```
┌─────────────────┐
│ AI Assistant    │  ← Generate scripts automatically
│                 │
│ - Suggest rules │
│ - Generate scripts
│ - Optimize code │
└─────────────────┘

┌─────────────────┐
│ Marketplace     │  ← Community scripts
│                 │
│ - Share scripts │
│ - Rate & review │
│ - Auto-update   │
└─────────────────┘
```

---

**Version :** 2.0.0  
**Date :** 2026-01-16  
**Auteur :** Claude (IA Assistant)
