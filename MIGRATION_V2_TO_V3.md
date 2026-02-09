# 🔄 Migration v2 → v3

## 📌 Contexte

Si vous avez déjà déployé **l'architecture v2** (avec `template_rules` table), voici le guide pour migrer vers **v3** (avec glide_list).

**Si vous n'avez PAS déployé v2, ignorez ce document et suivez directement `DEPLOIEMENT_V3.md`.**

---

## 🎯 Différences v2 vs v3

### Architecture v2 (Ancienne)

```
x_1310794_founda_0_analysis_templates
├─ base_query: "collection={0}^active=true"
└─ (pas de verification_items)

x_1310794_founda_0_template_rules (NOUVELLE TABLE M2M)
├─ template: FK → analysis_templates
├─ rule: FK → issue_rules
└─ (lien template → rules direct)

FHTemplateManager v2:
- Crée 1 seul VI avec toutes les rules du template
- Lit template_rules table
- Pas de réutilisabilité VI
```

### Architecture v3 (Nouvelle)

```
x_1310794_founda_0_analysis_templates
├─ verification_items: glide_list → verification_items
└─ (plus de base_query)

x_1310794_founda_0_verification_items
├─ is_template: boolean (nouveau)
├─ template_category: string (nouveau)
└─ issue_rules: glide_list → issue_rules (existe déjà)

x_1310794_founda_0_template_rules
└─ ❌ SUPPRIMÉE (plus nécessaire)

FHTemplateManager v3:
- Crée X VI instances (1 par VI template)
- Lit template.verification_items (glide_list)
- VI templates réutilisables
- Contrôle granulaire
```

---

## 🔄 Plan de Migration

### Étape 1 : Sauvegarder les Données Existantes (Optionnel)

Si vous avez des configurations importantes créées avec v2 :

```javascript
// Exporter les configs existantes
var configs = new GlideRecord('x_1310794_founda_0_configurations');
configs.addQuery('use_template', true);
configs.query();

var exportData = [];
while (configs.next()) {
    exportData.push({
        name: configs.name.toString(),
        table: configs.table.getDisplayValue(),
        template: configs.template.getDisplayValue()
    });
}

gs.info('Configs to migrate: ' + JSON.stringify(exportData, null, 2));
```

**Note** : Les configurations v2 continueront de fonctionner, mais vous ne pourrez pas les éditer avec v3.

---

### Étape 2 : Supprimer les Données v2

#### 2.1 Supprimer la Table template_rules

1. Naviguer : `System Definition > Tables`
2. Trouver : `x_1310794_founda_0_template_rules`
3. Clic droit > `Delete`
4. Confirmer

**Attention** : Cela supprime la table et toutes ses données.

#### 2.2 Supprimer les Templates v2

```javascript
// Script pour nettoyer les templates v2
(function() {
    
    gs.info('Cleaning v2 templates...');
    
    // Delete all analysis templates
    var templates = new GlideRecord('x_1310794_founda_0_analysis_templates');
    templates.query();
    var count = 0;
    while (templates.next()) {
        templates.deleteRecord();
        count++;
    }
    
    gs.info('✅ Deleted ' + count + ' v2 templates');
    
})();
```

#### 2.3 (Optionnel) Supprimer le Champ base_query

Le champ `base_query` sur `analysis_templates` n'est plus utilisé en v3.

1. Naviguer : `System Definition > Tables`
2. Ouvrir : `x_1310794_founda_0_analysis_templates`
3. Onglet : `Columns`
4. Trouver : `base_query`
5. Ouvrir et cocher : `Inactive`
6. Sauvegarder

---

### Étape 3 : Ajouter les Nouveaux Champs v3

#### 3.1 Sur verification_items

**Ajouter 2 champs** :

1. **is_template** (boolean)
   - Table : `x_1310794_founda_0_verification_items`
   - Type : `True/False`
   - Label : `Is Template`
   - Default : `false`

2. **template_category** (string)
   - Table : `x_1310794_founda_0_verification_items`
   - Type : `String`
   - Label : `Template Category`
   - Max length : `100`

#### 3.2 Sur analysis_templates

**Ajouter 1 champ** :

1. **verification_items** (glide_list)
   - Table : `x_1310794_founda_0_analysis_templates`
   - Type : `List`
   - Label : `Verification Items`
   - Reference : `x_1310794_founda_0_verification_items`

---

### Étape 4 : Déployer FHTemplateManager v3

1. Naviguer : `System Definition > Script Includes`
2. Trouver : `FHTemplateManager`
3. Copier le contenu de : `scripts/FHTemplateManager_v3.js`
4. Coller dans ServiceNow (remplacer v2)
5. Sauvegarder

---

### Étape 5 : Peupler les Templates v3

1. Copier : `scripts/populate_templates_v3.js`
2. Exécuter dans Scripts - Background
3. Vérifier :
   - ✅ 8 VI Templates créés
   - ✅ 6 Analysis Templates créés

---

### Étape 6 : Migrer les Configurations Existantes (Optionnel)

Si vous voulez recréer vos configurations v2 en v3 :

```javascript
// Script pour recréer une config en v3
(function migrateConfig() {
    
    var mgr = new x_1310794_founda_0.FHTemplateManager();
    
    // Example: Recréer "Users - BR Analysis"
    var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
    if (template.get('name', 'Business Rules Only')) {
        
        var configId = mgr.createFromTemplate(
            template.sys_id.toString(),
            'Users - BR Analysis (v3)',
            'sys_user',
            {
                ignore_servicenow_records: true
            }
        );
        
        gs.info('✅ Config migrated: ' + configId);
    }
    
})();
```

**Ou** : Supprimer les anciennes configs v2 et en créer de nouvelles via UI.

---

### Étape 7 : Supprimer les Anciennes Configurations v2 (Optionnel)

Si vous ne voulez pas conserver les configs v2 :

```javascript
// Script pour supprimer configs v2
(function() {
    
    var configs = new GlideRecord('x_1310794_founda_0_configurations');
    configs.addQuery('sys_created_on', '<', '2026-02-10');  // Avant migration
    configs.query();
    
    var count = 0;
    while (configs.next()) {
        gs.info('Deleting: ' + configs.name);
        configs.deleteRecord();
        count++;
    }
    
    gs.info('✅ Deleted ' + count + ' old configs');
    
})();
```

---

## ✅ Checklist Migration

### Phase 1 : Préparation

- [ ] Sauvegarder les données existantes (optionnel)
- [ ] Noter les configurations importantes

### Phase 2 : Nettoyage v2

- [ ] Supprimer table `template_rules`
- [ ] Supprimer templates v2
- [ ] Désactiver champ `base_query` (optionnel)

### Phase 3 : Installation v3

- [ ] Ajouter champ `is_template` sur `verification_items`
- [ ] Ajouter champ `template_category` sur `verification_items`
- [ ] Ajouter champ `verification_items` sur `analysis_templates`
- [ ] Déployer `FHTemplateManager_v3.js`

### Phase 4 : Population

- [ ] Exécuter `populate_templates_v3.js`
- [ ] Vérifier 8 VI Templates
- [ ] Vérifier 6 Analysis Templates

### Phase 5 : Test

- [ ] Tester création config avec template
- [ ] Tester analyse complète
- [ ] Vérifier résultats

### Phase 6 : Migration Données (Optionnel)

- [ ] Recréer configs importantes en v3
- [ ] Supprimer anciennes configs v2

---

## ⚠️ Points d'Attention

### 1. Configurations Existantes

Les configurations créées avec v2 **continueront de fonctionner** pour les analyses existantes, mais :
- ❌ Vous ne pourrez pas les éditer avec FHTemplateManager v3
- ❌ Les VI créés en v2 n'auront pas `is_template = false`
- ⚠️ Recommandé : Recréer les configs importantes en v3

### 2. Table template_rules

La suppression de cette table est **irréversible**. Assurez-vous que :
- ✅ Vous n'avez pas de code custom qui utilise cette table
- ✅ Vous avez sauvegardé les données si nécessaire

### 3. Compatibilité

FHTemplateManager v3 est **compatible** avec :
- ✅ `FHAnalyzer` (aucun changement)
- ✅ `FHAnalysisEngine` (aucun changement)
- ✅ Toutes les autres composantes

Les seuls changements sont dans :
- ❌ `FHTemplateManager` (remplacé)
- ❌ `populate_templates` (remplacé)

---

## 🎯 Différences Fonctionnelles

### Créer une Config : v2 vs v3

**v2** :
```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();
var configId = mgr.createFromTemplate(
    'template_sys_id',
    'Config Name',
    'target_table',
    { options }
);

// Résultat : 1 VI créé avec toutes les règles
```

**v3** :
```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();
var configId = mgr.createFromTemplate(
    'template_sys_id',
    'Config Name',
    'target_table',
    { options }
);

// Résultat : X VI créés (1 par VI template)
// Exemple : "Complete Health" → 5 VI
```

**Impact** :
- ✅ Plus de granularité
- ✅ Meilleure organisation des résultats
- ⚠️ Plus de VI dans la table (mais mieux structurés)

---

## 📊 Comparaison Tables

### Avant Migration (v2)

| Table | Enregistrements |
|-------|-----------------|
| `analysis_templates` | 10 templates |
| `template_rules` | 50 liens (5 rules × 10 templates) |
| `verification_items` | Variable (créés à la demande) |

### Après Migration (v3)

| Table | Enregistrements |
|-------|-----------------|
| `analysis_templates` | 6 templates |
| `template_rules` | ❌ Table supprimée |
| `verification_items` | 8 VI templates + instances créées à la demande |

**Résultat** :
- ✅ Moins de tables
- ✅ Modèle plus simple
- ✅ Meilleure réutilisabilité

---

## ✅ Validation Post-Migration

### Test 1 : Vérifier VI Templates

```javascript
var vi = new GlideRecord('x_1310794_founda_0_verification_items');
vi.addQuery('is_template', true);
vi.query();

gs.info('VI Templates: ' + vi.getRowCount());
// Expected: 8
```

### Test 2 : Vérifier Analysis Templates

```javascript
var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
template.query();

gs.info('Analysis Templates: ' + template.getRowCount());
// Expected: 6

while (template.next()) {
    var viCount = template.verification_items.toString().split(',').length;
    gs.info('  - ' + template.name + ': ' + viCount + ' VIs');
}
```

### Test 3 : Créer Config de Test

```javascript
var mgr = new x_1310794_founda_0.FHTemplateManager();

var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
template.get('name', 'Business Rules Only');

var configId = mgr.createFromTemplate(
    template.sys_id.toString(),
    'TEST - Migration v3',
    'sys_user',
    { ignore_servicenow_records: true }
);

// Verify
var config = new GlideRecord('x_1310794_founda_0_configurations');
config.get(configId);

var viIds = config.verification_items.toString().split(',');
gs.info('✅ VIs created: ' + viIds.length);
// Expected: 1

var vi = new GlideRecord('x_1310794_founda_0_verification_items');
vi.get(viIds[0]);
gs.info('✅ VI name: ' + vi.name);
gs.info('✅ VI query: ' + vi.query_value);
gs.info('✅ VI is_template: ' + vi.is_template);
// Expected: false (instance, not template)
```

---

## 🚀 Résumé

**Migration v2 → v3** :
1. ✅ Supprimer table `template_rules`
2. ✅ Ajouter 3 champs (2 sur VI, 1 sur templates)
3. ✅ Déployer `FHTemplateManager_v3.js`
4. ✅ Peupler templates v3
5. ✅ Tester
6. ✅ (Optionnel) Migrer configs existantes

**Durée** : ~20 minutes

**Bénéfices** :
- ✅ Architecture simplifiée (pas de M2M)
- ✅ Pattern ServiceNow standard (glide_list)
- ✅ Multi-VI par template
- ✅ Contrôle granulaire
- ✅ Meilleure réutilisabilité

**Questions ?** Consultez `DEPLOIEMENT_V3.md` ou `ARCHITECTURE_V3_GLIDE_LIST.md` ! 🎯
