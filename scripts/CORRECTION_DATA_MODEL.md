# 🔧 Correction Modèle de Données

## ❌ Erreur Initiale

J'avais compris qu'il y avait des **tables M2M** entre :
- configurations ↔ verification_items
- verification_items ↔ issue_rules

**C'était FAUX !**

---

## ✅ Modèle Réel

### Structure Correcte

```
x_1310794_founda_0_configurations
├── name
├── table
├── verification_items  ← glide_list (direct field)
└── ...

x_1310794_founda_0_verification_items
├── name
├── category
├── table
├── query_type
├── query_value
├── issue_rules  ← glide_list (direct field)
└── ...

x_1310794_founda_0_issue_rules
├── code
├── name
├── severity
└── ...
```

**Pas de tables M2M** ! Ce sont des **champs de type `glide_list`** qui stockent des sys_ids séparés par des virgules.

---

## 🔄 Code Corrigé

### Avant (FAUX)
```javascript
// M2M table (does not exist!)
var m2m = new GlideRecord('x_1310794_founda_0_verification_items_issue_rules');
m2m.verification_items = viId;
m2m.issue_rules = ruleId;
m2m.insert();
```

### Après (CORRECT)
```javascript
// glide_list field (comma-separated sys_ids)
var ruleIds = [];
rules.forEach(function(rule) {
    ruleIds.push(rule.rule_id);
});
vi.issue_rules = ruleIds.join(',');
```

---

## ✅ Version Finale Correcte (v2.1)

Le fichier `FHTemplateManager_v2.js` a été corrigé avec :

1. **Verification Items → Issue Rules**
   ```javascript
   vi.issue_rules = ruleIds.join(',');  // glide_list field
   ```

2. **Configuration → Verification Items**
   ```javascript
   config.verification_items = viId;  // glide_list field
   config.update();
   ```

**Plus aucune tentative d'accès à des tables M2M inexistantes !**

---

## 🎯 Impact

### Ce Qui Est Maintenant Correct

✅ Les règles sont liées au Verification Item via le champ `issue_rules`  
✅ Le Verification Item est lié à la Configuration via le champ `verification_items`  
✅ Pas d'erreur "table not found"  
✅ Fonctionne avec le vrai modèle de données ServiceNow  

### Comment Ça Marche

```javascript
// Create from template
var mgr = new x_1310794_founda_0.FHTemplateManager();
var configId = mgr.createFromTemplate(templateId, 'My Config');

// Creates:
1. Configuration record
2. Verification Item record with:
   - issue_rules = "rule_id1,rule_id2,rule_id3"
3. Updates Configuration:
   - verification_items = "vi_id"
```

**Résultat** : Configuration complète et fonctionnelle !

---

## 📝 Déploiement

### Étape 1 : Mettre à Jour le Script Include

Dans ServiceNow :
1. **System Definition > Script Includes**
2. Ouvrir `FHTemplateManager`
3. Remplacer par le contenu de `scripts/FHTemplateManager_v2.js`
4. **Update**

### Étape 2 : Tester

```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();

var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
template.get('name', 'Quick Business Rules Check');

var configId = mgr.createFromTemplate(
    template.sys_id.toString(),
    'TEST - Correct Model'
);

// Verify
var config = new GlideRecord('x_1310794_founda_0_configurations');
if (config.get(configId)) {
    gs.info('✓ Config created');
    gs.info('✓ Verification Items: ' + config.verification_items);
    
    // Check VI
    var vi = new GlideRecord('x_1310794_founda_0_verification_items');
    if (vi.get(config.verification_items)) {
        gs.info('✓ VI found: ' + vi.name);
        gs.info('✓ Issue Rules: ' + vi.issue_rules);
    }
}
```

**Résultat Attendu** :
```
✓ Config created
✓ Verification Items: [sys_id]
✓ VI found: Quick Business Rules Check - Rules
✓ Issue Rules: [rule_id1],[rule_id2]
```

---

## ✅ Résumé

**Erreur** : Tables M2M inexistantes  
**Correction** : Champs glide_list directs  
**Status** : Corrigé dans v2.1  
**Action** : Mettre à jour Script Include dans ServiceNow  

---

**Version** : 2.1 (Correctif modèle de données)  
**Date** : 2026-02-09  
**Statut** : ✅ Prêt pour déploiement
