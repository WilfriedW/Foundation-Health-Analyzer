# Corrections du Widget Analysis Detail

## 🎯 Objectif
Corriger le widget "Analysis detail" pour qu'il parse et affiche correctement les informations du JSON stocké dans le champ `details` de la table `x_1310794_founda_0_results`.

## 📊 Structure du JSON dans le champ `details`

Le JSON stocké a la structure suivante :

```json
{
  "configuration": {
    "sys_id": "...",
    "name": "Configuration Name",
    "table_name": "task",
    "table_label": "Task",
    "description": "Description...",
    "options": {
      "deep_scan": true,
      "include_children_tables": false,
      "ignore_servicenow_records": true,
      "include_ldap": false
    }
  },
  "result": {
    "success": true,
    "health_score": 75,
    "issues_high": 5,
    "issues_medium": 10,
    "issues_low": 3,
    "issue_count": 18,
    "record_count": 100,
    "issues": [
      {
        "code": "RULE001",
        "message": "Issue description...",
        "severity": "high",
        "table": "task",
        "record": "TASK001",
        "details": {...}
      }
    ],
    "errors": []
  }
}
```

## 🔧 Corrections apportées

### 1. **Script Serveur - Parsing du JSON** ✅

**Problème :** Le code qui faisait `JSON.parse()` était commenté, mais le code essayait d'utiliser la variable `parsedIssues` qui n'existait jamais.

**Solution :** Réécriture complète du parsing pour :
- Parser correctement le JSON du champ `details`
- Extraire toutes les propriétés de `configuration` et `result`
- Gérer les erreurs de parsing avec logs appropriés

**Propriétés extraites :**
```javascript
data.result = {
  // Données de base
  sys_id: "...",
  number: "FHA0001234",
  state: "completed",
  sys_created_on: "...",
  sys_updated_on: "...",
  sys_created_by: "admin",

  // Depuis configuration
  configuration_name: "...",
  configuration_description: "...",
  table_name: "...",
  table_label: "...",
  scope: "...",
  options: {...},

  // Depuis result
  issues: [...],
  health_score: 75,
  issues_high: 5,
  issues_medium: 10,
  issues_low: 3,
  issue_count: 18,
  record_count: 100,
  errors: [...]
}
```

### 2. **Client Script - Correction des severities** ✅

**Problème :** Incohérence de casse entre :
- Les données stockées (severities en **minuscules** : `"high"`, `"medium"`, `"low"`)
- Le client script qui utilisait des **MAJUSCULES** : `'HIGH'`, `'MEDIUM'`, `'LOW'`
- Le template qui appelait les fonctions avec des minuscules

**Solution :** Normalisation en minuscules partout avec conversion `.toLowerCase()` :

**Fonctions corrigées :**
- `getIssuesBySeverity()` - Comparaison case-insensitive
- `getSeverityIcon()` - Utilise des clés en minuscules
- `getSeverityColor()` - Utilise des clés en minuscules
- Compteurs dans `getTopTables()` - Convertit en minuscules avant comparaison

### 3. **Client Script - Ajout de fonctions manquantes** ✅

**Fonctions ajoutées :**

#### `getIssuesBySeverityForTable(tableName, severity)`
Filtre les issues par table ET par severity (utilisée dans les tableaux de statistiques).

```javascript
c.getIssuesBySeverityForTable = function(tableName, severity) {
  if (!c.result || !c.result.issues) return [];
  var sev = (severity || '').toLowerCase();
  return c.result.issues.filter(function(issue) {
    var issueTable = issue.parent_table || issue.table;
    var issueSev = (issue.severity || '').toLowerCase();
    return issueTable === tableName && issueSev === sev;
  });
};
```

#### `hasActiveFilters()`
Vérifie si des filtres sont actifs.

```javascript
c.hasActiveFilters = function() {
  return c.filters.search !== '' ||
         c.filters.severity !== 'all' ||
         c.filters.table !== 'all';
};
```

#### `clearFilters()`
Alias pour `resetFilters()`.

#### `expandAll()` et `collapseAll()`
Étendre/réduire tous les panneaux de détails des issues.

```javascript
c.expandAll = function() {
  if (!c.result || !c.result.issues) return;
  c.result.issues.forEach(function(issue) {
    issue.showDetails = true;
  });
};
```

## 📝 Récapitulatif des corrections

| Zone | Problème | Solution |
|------|----------|----------|
| **Script Serveur** | JSON non parsé | Parsing complet avec extraction de toutes les propriétés |
| **Client Script** | Severities en MAJUSCULES | Normalisation en minuscules partout |
| **Client Script** | Fonction manquante `getIssuesBySeverityForTable` | Ajout de la fonction |
| **Client Script** | Fonctions manquantes pour filtres | Ajout de `hasActiveFilters`, `clearFilters`, `expandAll`, `collapseAll` |

## 🧪 Test du widget

Pour tester les corrections :

1. **Accéder au widget** :
   ```
   /fha?id=fha_analysis_detail&sys_id=<SYS_ID_D_UNE_ANALYSE>
   ```

2. **Vérifier que les données s'affichent** :
   - Header avec statistiques (Total Issues, Critical, High, Medium, Low, Health Score)
   - Onglet Dashboard avec les graphiques
   - Onglet Issues Explorer avec la liste filtrable
   - Onglet Analytics avec les statistiques détaillées
   - Onglet Details avec les métadonnées
   - Onglet Raw Data avec le JSON complet

3. **Vérifier les logs** :
   Dans les System Logs, chercher :
   ```
   [FHA Analysis Detail] Successfully parsed JSON - X issues, health score: Y
   ```

## ✅ Points de validation

- [ ] Le JSON est correctement parsé (vérifier dans les logs)
- [ ] Les statistiques s'affichent dans le header (Total, Critical, High, Medium, Low, Health Score)
- [ ] Les issues s'affichent dans l'onglet "Issues Explorer"
- [ ] Les filtres fonctionnent (par severity, par table, recherche)
- [ ] Les boutons "Expand All" / "Collapse All" fonctionnent
- [ ] Les graphiques de distribution s'affichent correctement
- [ ] Le tableau des tables affectées affiche les bonnes données
- [ ] Le health score s'affiche correctement

## 🔍 Debug si problème

Si les données ne s'affichent toujours pas :

1. **Vérifier le JSON stocké** :
   ```javascript
   var gr = new GlideRecord('x_1310794_founda_0_results');
   gr.get('SYS_ID_HERE');
   var json = gr.getValue('details');
   gs.info('JSON: ' + json);
   try {
     var parsed = JSON.parse(json);
     gs.info('Parsed successfully: ' + JSON.stringify(parsed, null, 2));
   } catch(e) {
     gs.error('Parse error: ' + e.message);
   }
   ```

2. **Vérifier la structure des issues** :
   ```javascript
   var parsed = JSON.parse(json);
   if (parsed.result && parsed.result.issues) {
     parsed.result.issues.forEach(function(issue) {
       gs.info('Issue severity: ' + issue.severity + ' (type: ' + typeof issue.severity + ')');
     });
   }
   ```

3. **Tester dans la console du navigateur** :
   ```javascript
   console.log('Result:', angular.element('#widget_element').scope().c.result);
   console.log('Issues:', angular.element('#widget_element').scope().c.result.issues);
   console.log('Health Score:', angular.element('#widget_element').scope().c.result.health_score);
   ```

## 📌 Notes importantes

1. **Casse des severities** : Toujours en **minuscules** dans les données (`"high"`, `"medium"`, `"low"`, `"critical"`)
2. **Structure du JSON** : Toujours avec `configuration` et `result` à la racine
3. **Propriétés disponibles** : Toutes les propriétés listées dans la section "Propriétés extraites" sont maintenant disponibles dans `c.result`

## 🎨 Affichage dans le widget

Le widget affiche maintenant correctement :

1. **Header** : Numéro d'analyse, état, date de création, statistiques rapides
2. **Dashboard** : Vue d'ensemble avec distribution des issues, top tables affectées, catégories
3. **Issues Explorer** : Liste complète des issues avec filtres avancés et recherche
4. **Analytics** : Statistiques détaillées par severity et par table
5. **Details** : Informations sur la configuration et les métadonnées
6. **Raw Data** : JSON complet pour debug

---

**Date des corrections** : 2026-02-10
**Widget** : `sp_widget_3ee88bd48312f21083e1b4a6feaad39a.xml`
**Fichier** : Analysis detail (fha_analysis_detail)
