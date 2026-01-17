# Référence complète des Handlers

## 📚 Vue d'ensemble

Ce document détaille tous les handlers disponibles dans `FHARuleEvaluator`, leurs paramètres, et des exemples d'utilisation.

## 🏷️ Légende

- **Type** : `INDIVIDUAL` (un par enregistrement) ou `AGGREGATE` (un par dataset)
- **Complexité** : ⭐ Simple | ⭐⭐ Moyen | ⭐⭐⭐ Avancé
- **Remplaçable** : Peut être remplacé par un script personnalisé

---

## Handlers CORE (Génériques et réutilisables)

### 1. count_threshold

**Type:** AGGREGATE  
**Complexité:** ⭐  
**Description:** Vérifie si le nombre total d'enregistrements dépasse un seuil.

#### Paramètres

| Param       | Type   | Requis | Description   | Exemple |
| ----------- | ------ | ------ | ------------- | ------- |
| `threshold` | number | Oui    | Seuil maximum | `50`    |

#### Exemple de règle

```json
{
  "name": "Too many records",
  "code": "TOO_MANY_RECORDS",
  "type": "count_threshold",
  "severity": "medium",
  "params": "{\"threshold\": 50}"
}
```

#### Message généré

```
Too many records (81 > 50). Review and clean up unnecessary records.
```

---

### 2. br_density

**Type:** AGGREGATE  
**Complexité:** ⭐⭐  
**Description:** Vérifie si le nombre de Business Rules sur une table dépasse un seuil.

#### Paramètres

| Param       | Type   | Requis | Description         | Exemple |
| ----------- | ------ | ------ | ------------------- | ------- |
| `threshold` | number | Oui    | Seuil maximum de BR | `30`    |

#### Exemple de règle

```json
{
  "name": "Too many Business Rules",
  "code": "BR_TOO_MANY",
  "type": "br_density",
  "severity": "medium",
  "params": "{\"threshold\": 30}"
}
```

#### Message généré

```
Too many Business Rules (81 > 30) - Table: incident. Click to view all active Business Rules and consider consolidating to improve performance.
```

#### Détails retournés

- `count`: nombre total
- `threshold`: seuil configuré
- `table`: nom de la table
- `record_table`: "sys_script"
- `record_filter`: filtre pour afficher la liste
- `record_name`: texte du lien

---

### 3. inactive

**Type:** INDIVIDUAL  
**Complexité:** ⭐  
**Description:** Détecte les enregistrements inactifs.

#### Paramètres

Aucun paramètre requis.

#### Exemple de règle

```json
{
  "name": "Inactive record",
  "code": "INACTIVE",
  "type": "inactive",
  "severity": "low"
}
```

#### Message généré

```
Inactive record: "My Business Rule". Consider activating or removing if no longer needed.
```

---

### 4. system_created

**Type:** INDIVIDUAL  
**Complexité:** ⭐  
**Description:** Détecte les enregistrements créés par l'utilisateur "system".

#### Paramètres

Aucun paramètre requis.

#### Exemple de règle

```json
{
  "name": "System created",
  "code": "SYSTEM_CREATED",
  "type": "system_created",
  "severity": "low"
}
```

#### Message généré

```
Record "My Script Include" created by system user. Review ownership and ensure proper documentation.
```

---

### 5. missing_field

**Type:** INDIVIDUAL  
**Complexité:** ⭐  
**Description:** Vérifie si des champs requis sont manquants ou vides.

#### Paramètres

| Param               | Type   | Requis | Description               | Exemple                           |
| ------------------- | ------ | ------ | ------------------------- | --------------------------------- |
| `field` ou `fields` | string | Oui    | Champ(s) à vérifier (CSV) | `"description,short_description"` |

#### Exemple de règle

```json
{
  "name": "Missing description",
  "code": "MISSING_DESC",
  "type": "missing_field",
  "severity": "medium",
  "params": "{\"fields\": \"description,short_description\"}"
}
```

#### Message généré

```
Missing required field "description" in "My Record". This may cause issues or incomplete configuration.
```

---

### 6. size_threshold

**Type:** INDIVIDUAL  
**Complexité:** ⭐⭐  
**Description:** Vérifie si un champ dépasse une taille maximale.

#### Paramètres

| Param     | Type   | Requis | Description                  | Exemple    |
| --------- | ------ | ------ | ---------------------------- | ---------- |
| `field`   | string | Oui    | Nom du champ                 | `"script"` |
| `max_len` | number | Oui    | Taille maximale (caractères) | `2000`     |

#### Exemple de règle

```json
{
  "name": "Script too long",
  "code": "SCRIPT_TOO_LONG",
  "type": "size_threshold",
  "severity": "medium",
  "params": "{\"field\": \"script\", \"max_len\": 2000}"
}
```

#### Message généré

```
Field "script" too long in "My Business Rule": 3450 characters (limit: 2000, 173%). Consider refactoring or splitting.
```

#### Détails retournés

- `length`: taille actuelle
- `max_length`: taille maximale
- `percentage`: pourcentage par rapport à la limite
- `recommendation`: suggestion

---

### 7. duplicate

**Type:** INDIVIDUAL  
**Complexité:** ⭐⭐  
**Description:** Détecte les enregistrements en doublon basés sur des champs clés.

#### Paramètres

| Param        | Type   | Requis | Description                             | Exemple                |
| ------------ | ------ | ------ | --------------------------------------- | ---------------------- |
| `key_fields` | string | Non    | Champs pour détecter les doublons (CSV) | `"name,code"` (défaut) |

#### Exemple de règle

```json
{
  "name": "Duplicate record",
  "code": "DUPLICATE",
  "type": "duplicate",
  "severity": "medium",
  "params": "{\"key_fields\": \"name,collection\"}"
}
```

#### Message généré

```
Duplicate detected: "My Business Rule" has the same name, collection as another record. This may cause conflicts.
```

---

### 8. hardcoded_sys_id

**Type:** INDIVIDUAL  
**Complexité:** ⭐⭐⭐  
**Description:** Détecte les sys_id codés en dur dans les scripts et champs.

#### Paramètres

| Param    | Type   | Requis | Description                            | Exemple              |
| -------- | ------ | ------ | -------------------------------------- | -------------------- |
| `fields` | string | Non    | Champs supplémentaires à scanner (CSV) | `"script,condition"` |

#### Exemple de règle

```json
{
  "name": "Hardcoded sys_id",
  "code": "HARDCODED_SYSID",
  "type": "hardcoded_sys_id",
  "severity": "high",
  "params": "{\"fields\": \"script,condition,query\"}"
}
```

#### Message généré

```
Hardcoded sys_id(s) detected in "My Business Rule": 3 occurrence(s) in fields [script (2), condition (1)]. Replace with dynamic queries or GlideRecord lookups.
```

#### Détails retournés

- `total_sys_ids`: nombre total de sys_id trouvés
- `hits`: détail par champ
- `recommendation`: suggestion

---

## Handlers AVANCÉS (Nouveaux)

### 9. field_check

**Type:** INDIVIDUAL  
**Complexité:** ⭐⭐  
**Description:** Handler générique pour vérifier des conditions sur des champs.

#### Paramètres

| Param              | Type          | Requis          | Description                      | Valeurs possibles                                                                                           |
| ------------------ | ------------- | --------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `field`            | string        | Oui             | Nom du champ                     | `"active"`                                                                                                  |
| `operator`         | string        | Oui             | Opérateur de comparaison         | `equals`, `not_equals`, `contains`, `not_contains`, `empty`, `not_empty`, `regex`, `gt`, `lt`, `gte`, `lte` |
| `expected`         | string/number | Selon opérateur | Valeur attendue                  | `"true"`, `100`, etc.                                                                                       |
| `message_template` | string        | Non             | Template de message personnalisé | `"Field {field} is {operator} {expected}"`                                                                  |

#### Exemples

**Vérifier si un champ est vide :**

```json
{
  "name": "Missing priority",
  "code": "MISSING_PRIORITY",
  "type": "field_check",
  "severity": "medium",
  "params": "{\"field\": \"priority\", \"operator\": \"empty\", \"message_template\": \"Priority is not set\"}"
}
```

**Vérifier si un nombre dépasse un seuil :**

```json
{
  "name": "Order too high",
  "code": "ORDER_TOO_HIGH",
  "type": "field_check",
  "severity": "low",
  "params": "{\"field\": \"order\", \"operator\": \"gt\", \"expected\": 1000}"
}
```

**Vérifier un pattern regex :**

```json
{
  "name": "Invalid email format",
  "code": "INVALID_EMAIL",
  "type": "field_check",
  "severity": "medium",
  "params": "{\"field\": \"email\", \"operator\": \"regex\", \"expected\": \"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$\"}"
}
```

---

### 10. pattern_scan

**Type:** INDIVIDUAL  
**Complexité:** ⭐⭐⭐  
**Description:** Scan de patterns regex dans plusieurs champs.

#### Paramètres

| Param              | Type   | Requis | Description            | Exemple                     |
| ------------------ | ------ | ------ | ---------------------- | --------------------------- |
| `fields`           | string | Oui    | Champs à scanner (CSV) | `"script,condition,query"`  |
| `pattern`          | string | Oui    | Regex à chercher       | `"eval\\("`                 |
| `message_template` | string | Non    | Template de message    | `"Dangerous pattern found"` |

#### Exemple de règle

```json
{
  "name": "Dangerous eval() usage",
  "code": "EVAL_USAGE",
  "type": "pattern_scan",
  "severity": "high",
  "params": "{\"fields\": \"script,condition\", \"pattern\": \"eval\\\\(\", \"message_template\": \"Dangerous eval() found in {field}\"}"
}
```

#### Message généré

```
Dangerous eval() found in script of "My Client Script"
```

---

### 11. aggregate_metric

**Type:** AGGREGATE  
**Complexité:** ⭐⭐⭐  
**Description:** Handler agrégé personnalisable avec métriques.

#### Paramètres

| Param              | Type   | Requis               | Description              | Valeurs possibles                           |
| ------------------ | ------ | -------------------- | ------------------------ | ------------------------------------------- |
| `metric`           | string | Oui                  | Type de métrique         | `count`, `sum`, `avg`, `max`, `min`         |
| `field`            | string | Pour sum/avg/max/min | Champ à agréger          | `"priority"`                                |
| `threshold`        | number | Oui                  | Seuil                    | `100`                                       |
| `operator`         | string | Non                  | Opérateur de comparaison | `gt` (défaut), `lt`, `gte`, `lte`, `equals` |
| `message_template` | string | Non                  | Template de message      | -                                           |

#### Exemple de règle

```json
{
  "name": "Too many active records",
  "code": "TOO_MANY_ACTIVE",
  "type": "aggregate_metric",
  "severity": "medium",
  "params": "{\"metric\": \"count\", \"threshold\": 100, \"operator\": \"gt\"}"
}
```

---

## Handlers LEGACY (À remplacer par scripts)

Ces handlers sont toujours disponibles mais **devraient être remplacés** par des scripts personnalisés dans les règles de vérification.

### missing_acl, acl_issue, index_needed, risky_field, public_endpoint, public_access

**Type:** INDIVIDUAL  
**Complexité:** ⭐  
**Remplaçable:** ✅ Oui - Utiliser `field_check` ou script personnalisé

**Exemple de remplacement :**

Au lieu de :

```json
{
  "type": "missing_acl",
  "params": "{}"
}
```

Utiliser :

```json
{
  "type": "field_check",
  "params": "{\"field\": \"missing_acl\", \"operator\": \"equals\", \"expected\": \"true\"}"
}
```

Ou mieux, un script personnalisé :

```javascript
if (item.values.missing_acl === "true") {
  issues.push({
    code: rule.code,
    message:
      'Missing ACL on table "' + item.values.name + '". Add read/write ACLs.',
    severity: "high",
    details: {
      table_name: item.values.name,
      record_table: item.table,
      record_sys_id: item.sys_id,
      record_name: item.values.name,
      recommendation: "Create ACLs for this table",
    },
  });
}
```

### br_heavy, cs_heavy, ui_action, job_error, job_inactive, flow_error, flow_config, etc.

**Type:** INDIVIDUAL  
**Complexité:** ⭐  
**Remplaçable:** ✅ Oui - Utiliser scripts personnalisés

Ces handlers vérifient simplement des flags booléens. **Remplacez-les par des scripts** de la bibliothèque `SCRIPTS_LIBRARY.md` pour plus de flexibilité et de contrôle.

---

## 🎯 Guides de migration

### De handler booléen vers script personnalisé

**Avant :**

```json
{
  "name": "Heavy Business Rule",
  "code": "BR_HEAVY",
  "type": "br_heavy",
  "severity": "medium",
  "params": "{}"
}
```

**Après :**

```json
{
  "name": "Heavy Business Rule",
  "code": "BR_HEAVY",
  "type": "",
  "severity": "medium",
  "params": "{}",
  "script": "if (item.values.script) {\n  var lineCount = (item.values.script.match(/\\n/g) || []).length + 1;\n  if (lineCount > 100) {\n    issues.push({\n      code: rule.code,\n      message: 'Business Rule \"' + item.values.name + '\" is too complex: ' + lineCount + ' lines',\n      severity: 'medium',\n      details: {\n        line_count: lineCount,\n        record_table: item.table,\n        record_sys_id: item.sys_id,\n        record_name: item.values.name\n      }\n    });\n  }\n}"
}
```

### De plusieurs handlers vers field_check

**Avant (3 règles) :**

```json
[
  {"type": "missing_acl", ...},
  {"type": "acl_issue", ...},
  {"type": "risky_field", ...}
]
```

**Après (3 règles avec field_check) :**

```json
[
  {
    "type": "field_check",
    "params": "{\"field\": \"missing_acl\", \"operator\": \"equals\", \"expected\": \"true\"}"
  },
  {
    "type": "field_check",
    "params": "{\"field\": \"acl_too_wide\", \"operator\": \"equals\", \"expected\": \"true\"}"
  },
  {
    "type": "field_check",
    "params": "{\"field\": \"risky_field\", \"operator\": \"equals\", \"expected\": \"true\"}"
  }
]
```

---

## 📊 Matrice de décision : Quel handler utiliser ?

| Besoin                           | Handler recommandé  | Alternative                      |
| -------------------------------- | ------------------- | -------------------------------- |
| Compter des enregistrements      | `count_threshold`   | `aggregate_metric`               |
| Compter des BR sur une table     | `br_density`        | Script personnalisé              |
| Vérifier un champ vide           | `missing_field`     | `field_check`                    |
| Vérifier une condition sur champ | `field_check`       | Script personnalisé              |
| Chercher un pattern              | `pattern_scan`      | `hardcoded_sys_id` (pour sys_id) |
| Détecter des doublons            | `duplicate`         | Script personnalisé              |
| Logique complexe                 | Script personnalisé | -                                |
| Vérifier un flag booléen         | `field_check`       | Script personnalisé              |

---

## 🔧 Configuration avancée

### Combiner handler et script

Vous pouvez utiliser **à la fois** un handler ET un script personnalisé sur la même règle :

```json
{
  "name": "Complex check",
  "code": "COMPLEX_CHECK",
  "type": "size_threshold",
  "params": "{\"field\": \"script\", \"max_len\": 2000}",
  "script": "// Script personnalisé en plus du handler\nif (item.values.active === 'false' && item.values.script.length > 1000) {\n  issues.push({\n    code: 'INACTIVE_BUT_HEAVY',\n    message: 'Inactive but heavy script',\n    severity: 'low',\n    details: {}\n  });\n}"
}
```

Le handler s'exécute **ET** le script s'exécute, les issues sont combinées.

---

## 📚 Ressources

- **Exemples de scripts** : Voir `SCRIPTS_LIBRARY.md`
- **Pattern d'agrégation** : Voir `aggregate-handlers.md`
- **Tests** : Voir `TESTING_GUIDE_ISSUES.md`

---

**Date :** 2026-01-16  
**Version :** 2.0.0  
**Auteur :** Claude (IA Assistant)
