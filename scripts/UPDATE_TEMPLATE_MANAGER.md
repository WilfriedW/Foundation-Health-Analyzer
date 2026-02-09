# 🔧 Mise à Jour du Template Manager

## ⚠️ Problème Identifié

La version initiale de `FHTemplateManager` ne créait PAS les **Verification Items** nécessaires.

**Résultat** : Les configurations créées depuis templates étaient vides (pas de règles liées).

---

## ✅ Solution : Template Manager v2

### Ce Qui a Été Corrigé

La nouvelle version **crée automatiquement** :
1. ✅ La Configuration
2. ✅ Le Verification Item avec la query du template
3. ✅ Les liens vers les Issue Rules **ACTIVES**
4. ✅ Le lien entre Configuration et Verification Item

### Vérification des Règles Actives

Le nouveau code vérifie que chaque règle est **active** avant de la lier :

```javascript
// Verify rule is active
var ruleGr = new GlideRecord('x_1310794_founda_0_issue_rules');
if (ruleGr.get(gr.getValue('rule')) && ruleGr.active) {
    // Only add active rules
    rules.push({...});
}
```

**Bénéfice** : Seules les règles actives sont utilisées automatiquement.

---

## 📋 Étapes de Mise à Jour (5 min)

### Étape 1 : Mettre à Jour le Script Include

1. Dans ServiceNow, aller à : **System Definition > Script Includes**
2. Chercher : `FHTemplateManager`
3. Ouvrir le record
4. Remplacer TOUT le contenu du champ **Script** par le contenu de :
   ```
   scripts/FHTemplateManager_v2.js
   ```
5. **Update**

### Étape 2 : Tester

Exécuter dans **Scripts - Background** :

```javascript
// Test v2 - Complete creation
var mgr = new x_1310794_founda_0.FHTemplateManager();

// Find template
var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
template.get('name', 'Quick Business Rules Check');

// Create config
var configId = mgr.createFromTemplate(
    template.sys_id.toString(),
    'TEST v2 - With Verification Items'
);

gs.info('Config created: ' + configId);

// Verify verification items were created
var vi = new GlideRecord('x_1310794_founda_0_verification_items');
vi.addQuery('name', 'CONTAINS', template.getValue('name'));
vi.query();

gs.info('Verification Items created: ' + vi.getRowCount());

// Check rules are linked
if (vi.next()) {
    var rules = new GlideRecord('x_1310794_founda_0_verification_items_issue_rules');
    rules.addQuery('verification_items', vi.sys_id);
    rules.query();
    gs.info('Rules linked: ' + rules.getRowCount());
}
```

**Résultat Attendu** :
```
*** Script: Config created: [sys_id]
*** Script: Verification Items created: 1
*** Script: Rules linked: 2  (or more, depending on template)
```

### Étape 3 : Vérification Manuelle

1. Ouvrir la configuration créée
2. Onglet **Verification Items** : Doit contenir 1 item
3. Ouvrir le Verification Item
4. Onglet **Issue Rules** : Doit contenir les règles du template

✅ **Si tout est présent, la mise à jour est réussie !**

---

## 🎯 Comportement après Mise à Jour

### Création depuis Template

```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();
var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
template.get('name', 'Standard Business Rules Analysis');

var configId = mgr.createFromTemplate(
    template.sys_id.toString(),
    'My BR Analysis'
);
```

**Crée automatiquement** :
- ✅ Configuration "My BR Analysis"
- ✅ Verification Item "Standard Business Rules Analysis - Rules"
- ✅ Liens vers 5 règles actives (BR_HEAVY, HARDCODED_SYSID, etc.)
- ✅ Lien Configuration → Verification Item

### Si une Règle n'Existe Pas

Le code **saute simplement** les règles inexistantes ou inactives.

**Exemple** : Template référence "BR_HEAVY" mais la règle est désactivée
→ La règle n'est PAS ajoutée au Verification Item

**Pas d'erreur, comportement gracieux** ✅

---

## 📊 Comparaison Versions

### Version 1 (Initiale)
```
createFromTemplate()
  └─ Crée Configuration ✅
  └─ Crée Verification Items ❌
  └─ Lie les Règles ❌

Résultat : Config vide, pas de règles
```

### Version 2 (Corrigée)
```
createFromTemplate()
  └─ Crée Configuration ✅
  └─ Crée Verification Item ✅
  └─ Lie les Règles ACTIVES ✅
  └─ Lie Config → VI ✅

Résultat : Config complète et fonctionnelle
```

---

## 🧹 Nettoyage (Optionnel)

Si vous avez créé des configurations de test avec v1 (vides), vous pouvez les supprimer :

```javascript
// Delete test configurations created with v1
var gr = new GlideRecord('x_1310794_founda_0_configurations');
gr.addQuery('use_template', true);
gr.addQuery('name', 'STARTSWITH', 'TEST');
gr.query();

while (gr.next()) {
    // Check if it has verification items
    var vi = new GlideRecord('x_1310794_founda_0_configurations_verification_items');
    vi.addQuery('configurations', gr.sys_id);
    vi.query();
    
    if (!vi.hasNext()) {
        gs.info('Deleting empty config: ' + gr.name);
        gr.deleteRecord();
    }
}
```

---

## ✅ Validation Complète

Pour s'assurer que tout fonctionne, testez avec TOUS les templates :

```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();
var templates = mgr.getTemplates();

gs.info('Testing ' + templates.length + ' templates...');

templates.forEach(function(t) {
    try {
        var configId = mgr.createFromTemplate(
            t.sys_id,
            'TEST - ' + t.name
        );
        
        // Check verification items
        var vi = new GlideRecord('x_1310794_founda_0_verification_items');
        vi.addQuery('name', 'CONTAINS', t.name);
        vi.query();
        
        if (vi.hasNext()) {
            gs.info('✓ ' + t.name + ' : OK');
        } else {
            gs.error('✗ ' + t.name + ' : No VI created');
        }
        
    } catch (e) {
        gs.error('✗ ' + t.name + ' : ' + e);
    }
});
```

**Résultat Attendu** : 10/10 templates avec "✓ OK"

---

## 🎯 Résumé

**Avant v2** :
- Templates créaient des configs vides
- Pas de règles liées
- Analyses impossibles à lancer

**Après v2** :
- Templates créent des configs complètes
- Règles actives automatiquement liées
- Analyses prêtes à lancer immédiatement

**Action Requise** : Mettre à jour le Script Include dans ServiceNow (5 min)

---

**Version** : 2.0  
**Date** : 2026-02-09  
**Statut** : ✅ Correction critique - Déploiement immédiat recommandé
