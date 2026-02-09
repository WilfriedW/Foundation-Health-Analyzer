# ✅ Checklist : Mise en Place du Pattern Table Cible

## 📌 Contexte

Votre problème : **"Trop de BR à analyser"**  
Solution : **Analyser uniquement les BR d'une table spécifique**

---

## 🚀 Actions à Faire dans ServiceNow

### ☐ 1. Mettre à Jour FHTemplateManager

**Où** : `System Definition > Script Includes`

1. Trouver `FHTemplateManager`
2. Copier le contenu de `scripts/FHTemplateManager_v2.js`
3. Coller dans ServiceNow
4. Sauvegarder

**Nouveautés** :
- Paramètre `targetTable` ajouté à `createFromTemplate()`
- Remplacement automatique de `{0}` par le nom de la table cible

---

### ☐ 2. Recréer les Templates avec {0}

**Option A : Supprimer et Recréer (RECOMMANDÉ)**

1. Aller dans `x_1310794_founda_0_analysis_templates`
2. Supprimer TOUS les enregistrements
3. Aller dans `x_1310794_founda_0_template_rules`
4. Supprimer TOUS les enregistrements
5. Copier `scripts/populate_default_templates.js`
6. Exécuter dans Scripts - Background
7. Vérifier que 11 templates ont été créés

**Option B : Mise à Jour Manuelle**

Modifier le champ `base_query` de ces templates :

```
Business Rules Check
❌ Ancien : active=true^sys_packageISNOTEMPTY
✅ Nouveau : collection={0}^active=true^sys_packageISNOTEMPTY

Client Scripts Check
❌ Ancien : active=true^sys_packageISNOTEMPTY
✅ Nouveau : table={0}^active=true^sys_packageISNOTEMPTY

UI Actions Check
❌ Ancien : active=true^sys_packageISNOTEMPTY
✅ Nouveau : table={0}^active=true^sys_packageISNOTEMPTY

Security ACLs Check
❌ Ancien : active=true
✅ Nouveau : name={0}^ORname=*.{0}^ORname={0}.*^active=true
```

---

### ☐ 3. Tester avec le Script d'Exemple

**Où** : `System Definition > Scripts - Background`

1. Copier `scripts/analyze_table_with_template.js`
2. Configurer :
   ```javascript
   var TARGET_TABLE = 'sys_user';
   var TEMPLATE_NAME = 'Business Rules Check';
   var CONFIG_NAME = 'Users Table - BR Analysis';
   ```
3. Exécuter
4. Vérifier les logs :
   ```
   ✅ Template found: Business Rules Check
   ✅ Target table found: User [sys_user]
   ✅ Configuration created: [sys_id]
   ✅ Verification Item: Business Rules Check - sys_user
      - Query: collection=sys_user^active=true^sys_packageISNOTEMPTY
   🚀 Starting analysis...
   === ANALYSIS RESULTS ===
   Health Score: X%
   Total Issues: Y
   ```

---

### ☐ 4. Vérifier la Configuration

**Où** : `x_1310794_founda_0_configurations`

1. Ouvrir la configuration créée
2. Vérifier :
   - ✅ `table` = sys_user
   - ✅ `template` = Business Rules Check
   - ✅ `verification_items` pointe vers un VI

**Où** : `x_1310794_founda_0_verification_items`

1. Ouvrir le VI lié
2. Vérifier :
   - ✅ `name` = "Business Rules Check - sys_user"
   - ✅ `table` = sys_script
   - ✅ `query_value` = "collection=sys_user^active=true^sys_packageISNOTEMPTY"
   - ✅ `issue_rules` contient plusieurs règles (BR_HEAVY, HARDCODED_SYSID, etc.)

---

### ☐ 5. Tester une Vraie Analyse

**Objectif** : Vérifier que seules les BR de sys_user sont analysées

1. Trouver le nombre total de BR dans votre instance :
   ```javascript
   var gr = new GlideRecord('sys_script');
   gr.addQuery('active', true);
   gr.query();
   gs.info('Total BR: ' + gr.getRowCount());
   ```

2. Trouver le nombre de BR sur sys_user :
   ```javascript
   var gr = new GlideRecord('sys_script');
   gr.addQuery('collection', 'sys_user');
   gr.addQuery('active', true);
   gr.query();
   gs.info('BR on sys_user: ' + gr.getRowCount());
   ```

3. Lancer l'analyse (avec le script `analyze_table_with_template.js`)

4. Comparer :
   ```
   Total BR dans l'instance : 2,543
   BR sur sys_user : 23
   BR analysées : 23 ✅ (pas 2,543 !)
   ```

---

## 🎯 Cas d'Usage Final

### Votre Besoin Initial

> "Je souhaite savoir si les BR sur la table des user sont correctes"

### Comment le Faire Maintenant

```javascript
// 1. Choisir la table
var TARGET_TABLE = 'sys_user';

// 2. Choisir le template
var TEMPLATE_NAME = 'Business Rules Check';

// 3. Lancer le script analyze_table_with_template.js

// 4. Résultat : Analyse uniquement les BR de sys_user ✅
```

### Autre Exemple : Analyser CS sur Incident

```javascript
var TARGET_TABLE = 'incident';
var TEMPLATE_NAME = 'Client Scripts Check';

// Résultat : Analyse uniquement les CS de incident ✅
```

---

## 📚 Documentation de Référence

| Fichier | Description |
|---------|-------------|
| `TARGET_TABLE_PATTERN.md` | Architecture complète (détails techniques) |
| `UPDATE_TARGET_TABLE_PATTERN.md` | Guide de mise à jour (ce qui a changé) |
| `analyze_table_with_template.js` | Script prêt à l'emploi |
| `ACTIONS_TABLE_CIBLE.md` | Cette checklist |

---

## ✅ Résumé

**Avant** :
- ❌ Template analyse TOUTES les BR (2,543 BR)
- ❌ Trop de données, trop lent
- ❌ Pas de filtrage par table

**Après** :
- ✅ Template analyse les BR d'UNE table (23 BR)
- ✅ Rapide et ciblé
- ✅ Réponse précise à votre question

**Prochaine Étape** :
1. Déployer `FHTemplateManager_v2.js` ← COMMENCE ICI
2. Recréer les templates
3. Tester avec le script
4. Vérifier les résultats

**Questions ?** Faites-moi signe ! 🚀
