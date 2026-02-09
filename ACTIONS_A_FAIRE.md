# ✅ Actions à Faire dans ServiceNow - Checklist

**Date** : 9 février 2026  
**Durée Totale** : 15 minutes

---

## 🎯 Résumé de la Situation

**Ce qui a été fait** :
- ✅ Tables créées (analysis_templates, template_rules)
- ✅ Script Include v2.1 créé (corrigé)
- ✅ 10 templates pré-configurés (script prêt)
- ✅ Règles ACTIVES uniquement utilisées
- ✅ Champs glide_list corrects (pas de M2M)
- ✅ Duplication base_query identifiée et corrigée

**Ce qu'il reste à faire** :
- 🔲 Supprimer champ `base_query` de Configurations (optionnel mais recommandé)
- 🔲 Mettre à jour Script Include avec v2.1
- 🔲 Exécuter populate_default_templates.js
- 🔲 Tester la création d'une config depuis template
- 🔲 Lancer une vraie analyse

---

## 📋 ÉTAPE 1 : Cleanup (5 min) - OPTIONNEL mais RECOMMANDÉ

### Supprimer le Champ Dupliqué

**Pourquoi ?**
- `base_query` existe sur Configuration ET sur Verification Item
- C'est redondant
- La query est utilisée depuis le Verification Item

**Comment ?**

1. **System Definition > Tables**
2. Chercher : `x_1310794_founda_0_configurations`
3. Onglet **Columns**
4. Trouver : `base_query`
5. Ouvrir le champ
6. Cocher **Delete** (ou décocher **Active**)
7. **Update**

**Alternative** : Garder le champ mais ignorer - aucun impact sur le fonctionnement.

---

## 📋 ÉTAPE 2 : Script Include (5 min) - OBLIGATOIRE

### Mettre à Jour FHTemplateManager

1. **System Definition > Script Includes**
2. Chercher : `FHTemplateManager`
3. Ouvrir le record
4. **Script** : Remplacer TOUT par le contenu de :
   ```
   scripts/FHTemplateManager_v2.js
   ```
5. **Update**

**Ce qui a changé** :
- ✅ Crée les Verification Items automatiquement
- ✅ Utilise glide_list fields (pas de M2M)
- ✅ Vérifie que les règles sont ACTIVES
- ✅ Plus de duplication base_query

---

## 📋 ÉTAPE 3 : Créer les Templates (3 min) - OBLIGATOIRE

### Peupler les 10 Templates

1. **System Definition > Scripts - Background**
2. Copier le contenu de :
   ```
   scripts/populate_default_templates.js
   ```
3. **Run script**

**Résultat Attendu** :
```
*** Script: Created template: Standard Business Rules Analysis
*** Script: Created template: Quick Business Rules Check
*** Script: Created template: Security ACLs Audit
*** Script: Created template: Client Scripts Performance
*** Script: Created template: UI Actions Quality Check
*** Script: Created template: Scheduled Jobs Analysis
*** Script: Created template: Script Includes Review
*** Script: Created template: Email Notifications Audit
*** Script: Created template: REST Messages Security
*** Script: Created template: Service Portal Widgets
*** Script: Templates created: 10, Errors: 0
```

---

## 📋 ÉTAPE 4 : Test (2 min) - OBLIGATOIRE

### Créer une Config depuis Template

1. **System Definition > Scripts - Background**
2. Copier :
```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();

var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
template.get('name', 'Quick Business Rules Check');

var configId = mgr.createFromTemplate(
    template.sys_id.toString(),
    'TEST - My First Template Config'
);

gs.info('Config ID: ' + configId);

// Verify complete structure
var config = new GlideRecord('x_1310794_founda_0_configurations');
if (config.get(configId)) {
    gs.info('✓ Config name: ' + config.name);
    gs.info('✓ Verification Items: ' + config.verification_items);
    
    var vi = new GlideRecord('x_1310794_founda_0_verification_items');
    if (vi.get(config.verification_items)) {
        gs.info('✓ VI name: ' + vi.name);
        gs.info('✓ VI query: ' + vi.query_value);
        gs.info('✓ Issue rules: ' + vi.issue_rules);
        
        var ruleCount = vi.issue_rules.toString().split(',').length;
        gs.info('✓ Rules count: ' + ruleCount);
    }
}
```

**Résultat Attendu** :
```
Config ID: [sys_id]
✓ Config name: TEST - My First Template Config
✓ Verification Items: [vi_sys_id]
✓ VI name: Quick Business Rules Check - Rules
✓ VI query: active=true^sys_packageISNOTEMPTY
✓ Issue rules: [rule_id1],[rule_id2]
✓ Rules count: 2
```

**Si vous voyez ça** → ✅ Tout fonctionne !

---

## 📋 ÉTAPE 5 : Vraie Analyse (5 min) - TEST RÉEL

### Lancer une Analyse sur Vos Business Rules

```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();

// Create config from template
var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
template.get('name', 'Standard Business Rules Analysis');

var configId = mgr.createFromTemplate(
    template.sys_id.toString(),
    'Real Analysis - Business Rules',
    {
        ignore_servicenow_records: true,
        deep_scan: false
    }
);

gs.info('Config created: ' + configId);

// Run analysis immediately
var analyzer = new x_1310794_founda_0.FHAnalyzer();
var result = analyzer.runAnalysis(configId);

gs.info('===== ANALYSIS RESULTS =====');
gs.info('Health Score: ' + result.details.health_score);
gs.info('Issues Found: ' + result.details.issues.length);
gs.info('');

// Show issues by severity
var bySeverity = {high: [], medium: [], low: []};
result.details.issues.forEach(function(issue) {
    bySeverity[issue.severity].push(issue);
});

gs.info('HIGH: ' + bySeverity.high.length);
bySeverity.high.forEach(function(i) {
    gs.info('  - ' + i.code + ': ' + i.message);
});

gs.info('MEDIUM: ' + bySeverity.medium.length);
bySeverity.medium.slice(0, 3).forEach(function(i) {
    gs.info('  - ' + i.code + ': ' + i.message);
});

gs.info('LOW: ' + bySeverity.low.length);
```

**Résultat** : Vous verrez les VRAIS problèmes détectés sur vos Business Rules !

---

## ✅ Validation Finale

Si tout fonctionne, vous devriez voir :

1. ✅ Une configuration créée en 30 secondes
2. ✅ Un Verification Item automatiquement créé
3. ✅ Les règles ACTIVES liées (HARDCODED_SYSID, BR_HEAVY, etc.)
4. ✅ Une analyse qui se lance
5. ✅ Des issues détectés (sys_ids hardcodés, BR lourdes, etc.)

---

## 🎯 Checklist Complète

### Dans ServiceNow

**Cleanup** (Optionnel - 5 min)
- [ ] Supprimer/Désactiver champ `base_query` de configurations

**Installation** (Obligatoire - 10 min)
- [ ] Mettre à jour Script Include `FHTemplateManager` avec v2.1
- [ ] Exécuter `populate_default_templates.js`
- [ ] Vérifier 10 templates créés

**Test** (Obligatoire - 5 min)
- [ ] Exécuter test de création config depuis template
- [ ] Vérifier structure (Config → VI → Rules)
- [ ] Vérifier que VI a bien `query_value` rempli
- [ ] Vérifier que les règles sont présentes dans `issue_rules`

**Analyse Réelle** (Test Final - 5 min)
- [ ] Créer config "Real Analysis - Business Rules"
- [ ] Lancer l'analyse
- [ ] Examiner les résultats
- [ ] Voir si HARDCODED_SYSID détecte bien les sys_ids

---

## 📞 Support

**Fichiers à consulter** :
- `scripts/FHTemplateManager_v2.js` - Script Include corrigé
- `scripts/populate_default_templates.js` - Créer les templates
- `scripts/CLEANUP_BASE_QUERY.md` - Pourquoi supprimer base_query
- `scripts/CORRECTION_DATA_MODEL.md` - Correction glide_list

**Temps Total** : ~15 minutes maximum

---

## 🎉 Une Fois Terminé

Vous aurez :
- ✅ 10 templates prêts à l'emploi
- ✅ Système fonctionnel
- ✅ Création de config en 30 secondes
- ✅ Détection automatique des problèmes
- ✅ **Plus de scripting manuel requis**

**Et on pourra alors ajouter plus de règles de détection si nécessaire !**

---

**Status** : ✅ Tout est prêt côté code  
**Action** : À vous de déployer dans ServiceNow  
**Prochaine étape** : Test réel avec analyse
