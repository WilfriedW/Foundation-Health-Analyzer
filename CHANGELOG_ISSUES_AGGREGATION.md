# Amélioration de l'agrégation des issues - BR_TOO_MANY

## 🎯 Problème identifié

L'analyse générait **86 issues identiques** pour "Too many Business Rules" alors qu'il n'y en avait en réalité qu'**une seule** par table.

### Cause racine

Les handlers `br_density` et `count_threshold` étaient appelés **pour chaque enregistrement** individuellement (une fois par Business Rule) et retournaient une issue à chaque fois que le seuil était dépassé.

**Exemple :**
- Table avec 81 Business Rules
- Seuil configuré à 30
- Résultat : 81 issues identiques au lieu d'une seule ❌

## ✅ Solution implémentée

### 1. Agrégation des issues au niveau du handler

**Fichier modifié :** `sys_script_include_cccafeed53163610c7233ee0a0490abc.xml` (FHARuleEvaluator)

Les handlers `br_density` et `count_threshold` utilisent maintenant un **système de flag** dans le contexte pour ne déclencher l'issue qu'**une seule fois** par dataset :

```javascript
// Aggregate rule: only fire once per dataset, not per item
if (!context) context = {};
if (!context._aggregateIssuesFired) context._aggregateIssuesFired = {};
var key = 'br_density_' + rule.code;
if (context._aggregateIssuesFired[key]) return [];

if (threshold && count > threshold) {
    context._aggregateIssuesFired[key] = true;
    // ... retourne l'issue une seule fois
}
```

### 2. Enrichissement des informations

**Message amélioré :**
- Avant : `"Too many Business Rules (81 > 30)"`
- Après : `"Too many Business Rules (81 > 30) - Table: incident. Click to view all active Business Rules and consider consolidating to improve performance."`

**Détails ajoutés :**
```javascript
{
    count: 81,
    threshold: 30,
    table: 'incident',
    record_table: 'sys_script',
    record_filter: 'collection=incident^active=true',
    record_name: 'View 81 Business Rules'
}
```

### 3. Propagation correcte des métadonnées

**Fichier modifié :** `sys_script_include_033a4751531a3610c7233ee0a0490e0f.xml` (FHAnalysisEngine)

Le moteur d'analyse propage maintenant correctement les champs personnalisés depuis les détails de l'issue :

```javascript
aggregatedIssues.push({
    code: is.code || '',
    message: is.message || '',
    severity: is.severity || 'medium',
    record_table: issueDetails.record_table || item.table || '',
    record_sys_id: issueDetails.record_sys_id || item.sys_id || '',
    record_name: issueDetails.record_name || (item.values && item.values.name) || '',
    record_filter: issueDetails.record_filter || '',  // ✨ NOUVEAU
    category: item.category || '',
    details: issueDetails
});
```

## 📊 Résultat attendu

### Avant
```
Issues (86)
--------------------------------------------------------------------
MEDIUM | automation | BR_TOO_MANY | Too many Business Rules (81 > 30) | sys_script | Read only Type when not initial state
MEDIUM | automation | BR_TOO_MANY | Too many Business Rules (81 > 30) | sys_script | Change Model: Set work start
MEDIUM | automation | BR_TOO_MANY | Too many Business Rules (81 > 30) | sys_script | Mandatory Closure Information
... (83 lignes identiques de plus)
```

### Après
```
Issues (1)
--------------------------------------------------------------------
MEDIUM | automation | BR_TOO_MANY | Too many Business Rules (81 > 30) - Table: incident. 
                                     Click to view all active Business Rules and 
                                     consider consolidating to improve performance. | sys_script | 🔗 View 81 Business Rules
```

## 🔧 Impact technique

### Fichiers modifiés
1. `d852994c8312321083e1b4a6feaad3e6/update/sys_script_include_cccafeed53163610c7233ee0a0490abc.xml`
   - Handler `br_density` : agrégation + enrichissement
   - Handler `count_threshold` : agrégation + enrichissement

2. `d852994c8312321083e1b4a6feaad3e6/update/sys_script_include_033a4751531a3610c7233ee0a0490e0f.xml`
   - Méthode `_analyzeResults` : propagation des métadonnées

### Compatibilité
- ✅ Rétrocompatible : les handlers existants fonctionnent toujours
- ✅ Pas de changement d'API
- ✅ Pas de migration de données nécessaire

## 🎁 Bénéfices

1. **Lisibilité** : Une seule issue claire au lieu de dizaines de duplicatas
2. **Performance** : Moins de données à traiter et afficher
3. **Actionnable** : Lien direct vers la liste des Business Rules concernées
4. **Informatif** : Message enrichi avec le nom de la table et le nombre exact de BR
5. **Extensible** : Le pattern peut être réutilisé pour d'autres handlers agrégés

## 🚀 Prochaines étapes recommandées

1. **Tester** l'analyse sur une table avec beaucoup de BR (ex: incident)
2. **Vérifier** que le lien "View X Business Rules" ouvre bien la bonne liste
3. **Appliquer** le même pattern à d'autres handlers si nécessaire (ex: cs_density pour les Client Scripts)
4. **Documenter** dans l'interface les seuils recommandés par type de table

---

**Date :** 2026-01-16  
**Version :** 1.0.0  
**Auteur :** Assistant IA (Claude)
