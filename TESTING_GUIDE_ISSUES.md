# Guide de test - Agrégation des issues BR_TOO_MANY

## 🧪 Comment tester les modifications

### Prérequis

1. Importer les fichiers modifiés dans votre instance ServiceNow
2. Avoir une table avec plus de 30 Business Rules actives (ex: `incident`, `change_request`)

### Étape 1 : Vérifier les fichiers modifiés

Dans ServiceNow, naviguer vers :

**Script Include - FHARuleEvaluator**
- Aller dans : `System Definition > Script Includes`
- Chercher : `FHARuleEvaluator`
- Vérifier que les handlers `br_density` et `count_threshold` contiennent le code d'agrégation

**Script Include - FHAnalysisEngine**
- Aller dans : `System Definition > Script Includes`
- Chercher : `FHAnalysisEngine`
- Vérifier que `_analyzeResults` propage bien `record_filter`

### Étape 2 : Configurer une règle de test

1. Naviguer vers : `Foundation Health Analyzer > Issue Rules`
2. Créer ou modifier une règle :
   - **Name** : "Too many Business Rules"
   - **Code** : `BR_TOO_MANY`
   - **Type** : `br_density`
   - **Severity** : `medium`
   - **Params** : `{"threshold": 30}`
3. Sauvegarder

### Étape 3 : Créer un Verification Item

1. Naviguer vers : `Foundation Health Analyzer > Verification Items`
2. Créer un item :
   - **Name** : "Business Rules on Incident"
   - **Category** : `automation`
   - **Table** : `sys_script`
   - **Query Type** : `encoded`
   - **Query Value** : `collection=incident^active=true`
   - **Fields** : `name,collection,active,order,when`
   - **Issue Rules** : Sélectionner la règle "Too many Business Rules"
3. Sauvegarder

### Étape 4 : Lancer l'analyse

1. Naviguer vers le portail FHA
2. Créer une nouvelle analyse pour la table `incident`
3. Attendre la fin de l'exécution

### Étape 5 : Vérifier les résultats

#### ✅ Résultat attendu (CORRECT)

Dans l'onglet **Issues** :
- **Une seule ligne** avec le code `BR_TOO_MANY`
- Message : `"Too many Business Rules (81 > 30) - Table: incident. Click to view all active Business Rules..."`
- Colonne RECORD : Lien `"View 81 Business Rules"` (ou le nombre réel)
- Cliquer sur le lien ouvre une liste des Business Rules filtrée : `collection=incident^active=true`

#### ❌ Résultat incorrect (BUG)

- Plusieurs lignes identiques (81 ou 86)
- Pas de lien cliquable
- Message sans le nom de la table

### Étape 6 : Test de bout en bout

1. **Cliquer sur le lien** dans la colonne RECORD
2. Vérifier que vous arrivez sur une liste `sys_script` filtrée
3. Compter les lignes → doit correspondre au nombre dans le message
4. Vérifier que tous les BR ont `collection=incident` et `active=true`

## 🔍 Tests de régression

### Test 1 : Handler count_threshold

Créer une règle similaire mais pour un autre type :
- **Type** : `count_threshold`
- **Params** : `{"threshold": 10}`
- Appliquer sur une table avec > 10 enregistrements
- Vérifier qu'**une seule issue** est générée

### Test 2 : Handlers individuels (non agrégés)

Les autres handlers (ex: `inactive`, `missing_field`) doivent continuer à fonctionner normalement :
- Créer une règle avec type `inactive`
- Vérifier qu'**une issue par enregistrement inactif** est bien générée

### Test 3 : Plusieurs tables

Lancer l'analyse sur plusieurs tables différentes :
- Table A avec 50 BR → 1 issue
- Table B avec 80 BR → 1 issue
- Table C avec 20 BR → 0 issue (sous le seuil)

## 📸 Captures d'écran attendues

### Avant (bug)
```
SEVERITY | CATEGORY   | CODE         | MESSAGE                              | TABLE      | RECORD
---------|------------|--------------|--------------------------------------|------------|--------------------
MEDIUM   | automation | BR_TOO_MANY  | Too many Business Rules (81 > 30)   | sys_script | Read only Type...
MEDIUM   | automation | BR_TOO_MANY  | Too many Business Rules (81 > 30)   | sys_script | Change Model...
MEDIUM   | automation | BR_TOO_MANY  | Too many Business Rules (81 > 30)   | sys_script | Mandatory Closure...
...      | ...        | ...          | ...                                  | ...        | ...
(81 lignes identiques)
```

### Après (corrigé)
```
SEVERITY | CATEGORY   | CODE         | MESSAGE                                                          | TABLE      | RECORD
---------|------------|--------------|------------------------------------------------------------------|------------|--------------------
MEDIUM   | automation | BR_TOO_MANY  | Too many Business Rules (81 > 30) - Table: incident. Click...  | sys_script | 🔗 View 81 Business Rules
```

## 🐛 Dépannage

### Problème : Toujours plusieurs issues identiques

**Solutions :**
1. Vérifier que les fichiers ont bien été importés/mis à jour
2. Vider le cache des Script Includes : `system_diagnostics.do` > Flush cache
3. Relancer une nouvelle analyse (ne pas réutiliser une ancienne)

### Problème : Le lien ne fonctionne pas

**Solutions :**
1. Vérifier que le widget affiche bien le champ `record_filter`
2. Inspecter l'objet issue dans la console : `console.log(c.result.issues)`
3. Vérifier que `record_filter` est bien présent dans l'objet

### Problème : Le nom de la table est "unknown"

**Causes possibles :**
1. Le champ `collection` n'est pas remonté dans les données
2. Ajouter `collection` dans le champ **Fields** du Verification Item

## ✅ Checklist de validation

- [ ] Import des fichiers modifiés réussi
- [ ] Une seule issue BR_TOO_MANY par table
- [ ] Message enrichi avec le nom de la table
- [ ] Lien cliquable dans la colonne RECORD
- [ ] Lien ouvre la bonne liste de BR
- [ ] Comptage correct du nombre de BR
- [ ] Autres handlers non affectés (test de régression)
- [ ] Performance : temps d'analyse similaire ou amélioré

---

**Date :** 2026-01-16  
**Support :** Pour toute question, consulter le fichier `CHANGELOG_ISSUES_AGGREGATION.md`
