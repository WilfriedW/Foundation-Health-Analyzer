# Revue complète des Handlers - FHARuleEvaluator

## 📊 Inventaire des handlers

### Handlers AGRÉGÉS (analyse au niveau du dataset)
Ces handlers doivent utiliser le pattern d'agrégation pour éviter les duplicatas.

| Handler | Status | Description | Amélioration nécessaire |
|---------|--------|-------------|------------------------|
| `count_threshold` | ✅ Corrigé | Compte le total d'enregistrements | Pattern d'agrégation appliqué |
| `br_density` | ✅ Corrigé | Compte les Business Rules sur une table | Pattern d'agrégation appliqué |

### Handlers INDIVIDUELS (analyse par enregistrement)
Ces handlers évaluent chaque enregistrement individuellement.

| Handler | Status | Description | Amélioration proposée |
|---------|--------|-------------|----------------------|
| `inactive` | 🟡 À améliorer | Détecte les enregistrements inactifs | Message plus descriptif |
| `system_created` | 🟡 À améliorer | Détecte les enregistrements créés par 'system' | Ajouter recommandation |
| `missing_field` | 🟡 À améliorer | Vérifie les champs manquants | Message plus clair |
| `missing_acl` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `acl_issue` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `index_needed` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `size_threshold` | 🟢 OK | Vérifie la longueur des champs | Bon état |
| `risky_field` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `duplicate` | 🟢 OK | Détecte les doublons name/code | Bon état |
| `public_endpoint` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `public_access` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `br_heavy` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `cs_heavy` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `ui_action` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `job_error` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `job_inactive` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `flow_error` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `flow_config` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `notification` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `integration_error` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `integration_config` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `hardcoded_sys_id` | 🟢 OK | Scan de sys_id en dur dans le code | Complexe, garder |
| `widget_perf` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `query_scan` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `script_weight` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `audit` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `security` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `catalog` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `mail_config` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |
| `observability` | 🔴 Simplifiable | Flag booléen - peut être fait en script | → Script |

## 🎯 Stratégie d'amélioration

### Phase 1 : Simplifier les handlers (RECOMMANDÉ)

**Principe :** Les handlers doivent être des **outils génériques réutilisables**, pas de la logique métier spécifique.

**Handlers à conserver :**
- ✅ `count_threshold` - Générique : compte les enregistrements
- ✅ `br_density` - Générique : compte avec contexte de table
- ✅ `inactive` - Générique : vérifie le champ active
- ✅ `system_created` - Générique : vérifie sys_created_by
- ✅ `missing_field` - Générique : vérifie des champs
- ✅ `size_threshold` - Générique : vérifie la longueur
- ✅ `duplicate` - Générique : détecte les doublons
- ✅ `hardcoded_sys_id` - Générique : scan de patterns

**Handlers à remplacer par un handler générique :**

Créer un handler `field_check` générique :
```javascript
field_check: function(item, rule, params) {
    // Vérifie une condition sur un champ
    var field = params.field;
    var value = item.values && item.values[field];
    var operator = params.operator; // 'equals', 'contains', 'regex', 'empty', 'true', 'false'
    var expected = params.expected;
    
    // Logique de comparaison...
}
```

Tous les handlers booléens (missing_acl, br_heavy, job_error, etc.) deviennent :
```json
{
  "type": "field_check",
  "params": {
    "field": "heavy_br",
    "operator": "equals",
    "expected": "true"
  },
  "script": "// Logique spécifique si nécessaire"
}
```

### Phase 2 : Améliorer les messages et détails

Pour tous les handlers conservés, enrichir :
1. **Messages** : Plus descriptifs et actionnables
2. **Détails** : Liens directs, valeurs actuelles vs attendues
3. **Recommandations** : Bonnes pratiques

### Phase 3 : Créer une bibliothèque de scripts

Documenter des exemples de scripts pour chaque cas d'usage :
- Business Rules lourdes
- Client Scripts lourds
- Jobs en erreur
- ACLs manquantes
- Etc.

## 💡 Nouvelle architecture proposée

### Handlers core (8 handlers génériques)

1. **count_threshold** - Compte total d'enregistrements
2. **aggregate_check** - Vérification agrégée personnalisable
3. **inactive** - Enregistrements inactifs
4. **system_created** - Créé par system
5. **missing_field** - Champs manquants ou vides
6. **field_check** - Vérification générique de champ
7. **size_threshold** - Taille de champ
8. **duplicate** - Détection de doublons
9. **pattern_scan** - Scan de patterns (sys_id, etc.)

### Scripts personnalisés (dans les règles)

Toute la logique métier spécifique va dans le champ `script` des règles :

```javascript
// Exemple : Détecter les Business Rules lourdes
if (item.values.script && item.values.script.length > 1000) {
    var lineCount = (item.values.script.match(/\n/g) || []).length;
    if (lineCount > 100) {
        issues.push({
            code: rule.code,
            message: 'Business Rule too complex (' + lineCount + ' lines). Consider refactoring.',
            severity: 'medium',
            details: {
                line_count: lineCount,
                record_table: item.table,
                record_sys_id: item.sys_id,
                record_name: item.values.name
            }
        });
    }
}
```

## 📋 Plan d'action

1. ✅ Analyser tous les handlers existants
2. ⏭️ Créer les nouveaux handlers génériques
3. ⏭️ Améliorer les handlers conservés
4. ⏭️ Créer la bibliothèque de scripts d'exemples
5. ⏭️ Documenter les paramètres de chaque handler
6. ⏭️ Créer des règles de vérification avec scripts

---

**Date :** 2026-01-16  
**Version :** 2.0.0
