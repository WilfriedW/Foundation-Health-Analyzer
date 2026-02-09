# 🎨 Schéma Architecture v3 : glide_list

## 📊 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NIVEAU 1 : VI TEMPLATES                       │
│                         (Réutilisables)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  x_1310794_founda_0_verification_items                              │
│  ┌────────────────────────────────────────────────────────┐         │
│  │ VI Template: "Business Rules Check"                    │         │
│  │ ├─ is_template: true                                   │         │
│  │ ├─ table: sys_script                                   │         │
│  │ ├─ query_value: "collection={0}^active=true"           │         │
│  │ └─ issue_rules: [BR_HEAVY, HARDCODED_SYSID, ...]      │         │
│  │    (glide_list → x_1310794_founda_0_issue_rules)       │         │
│  └────────────────────────────────────────────────────────┘         │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐         │
│  │ VI Template: "Client Scripts Check"                    │         │
│  │ ├─ is_template: true                                   │         │
│  │ ├─ table: sys_script_client                            │         │
│  │ ├─ query_value: "table={0}^active=true"                │         │
│  │ └─ issue_rules: [CS_HEAVY, HARDCODED_SYSID]           │         │
│  └────────────────────────────────────────────────────────┘         │
│                                                                      │
│  + 6 autres VI templates...                                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                        glide_list
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     NIVEAU 2 : ANALYSIS TEMPLATES                    │
│                      (Ensembles thématiques)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  x_1310794_founda_0_analysis_templates                              │
│  ┌────────────────────────────────────────────────────────┐         │
│  │ Template: "Complete Table Health Check"                │         │
│  │ ├─ table: {0}                                          │         │
│  │ ├─ category: complete                                  │         │
│  │ └─ verification_items: [glide_list]                    │         │
│  │    ├─ Business Rules Check                             │         │
│  │    ├─ Client Scripts Check                             │         │
│  │    ├─ UI Actions Check                                 │         │
│  │    ├─ Security ACLs Check                              │         │
│  │    └─ Notifications Check                              │         │
│  └────────────────────────────────────────────────────────┘         │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐         │
│  │ Template: "Business Rules Only"                        │         │
│  │ ├─ table: {0}                                          │         │
│  │ ├─ category: automation                                │         │
│  │ └─ verification_items: [glide_list]                    │         │
│  │    └─ Business Rules Check                             │         │
│  └────────────────────────────────────────────────────────┘         │
│                                                                      │
│  + 4 autres analysis templates...                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                  createFromTemplate() + Clone
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    NIVEAU 3 : CONFIGURATION                          │
│                     (Instance spécifique)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  x_1310794_founda_0_configurations                                  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │ OPTION A : Template Complet                             │        │
│  │ ───────────────────────────────────────────────────────  │        │
│  │ Configuration: "Users - Complete Health"                │        │
│  │ ├─ table: sys_user (Table CIBLE)                        │        │
│  │ ├─ template: "Complete Table Health Check"              │        │
│  │ ├─ use_template: true                                   │        │
│  │ └─ verification_items: [glide_list] ← Créé auto         │        │
│  │    ├─ VI Instance: "BR Check - sys_user"                │        │
│  │    │  (query: "collection=sys_user^active=true")        │        │
│  │    ├─ VI Instance: "CS Check - sys_user"                │        │
│  │    │  (query: "table=sys_user^active=true")             │        │
│  │    ├─ VI Instance: "UI Actions Check - sys_user"        │        │
│  │    ├─ VI Instance: "ACLs Check - sys_user"              │        │
│  │    └─ VI Instance: "Notifications Check - sys_user"     │        │
│  │                                                          │        │
│  │ → 5 VI clonés automatiquement ✅                         │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │ OPTION B : Sélection Manuelle                           │        │
│  │ ───────────────────────────────────────────────────────  │        │
│  │ Configuration: "Users - BR Security Only"               │        │
│  │ ├─ table: sys_user (Table CIBLE)                        │        │
│  │ ├─ use_template: false                                  │        │
│  │ └─ verification_items: [glide_list] ← Sélection manuelle│        │
│  │    └─ VI Instance: "BR Security - sys_user"             │        │
│  │       (query: "collection=sys_user^active=true")        │        │
│  │                                                          │        │
│  │ → 1 seul VI (contrôle total) ✅                          │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                     FHAnalyzer.runAnalysis()
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                          RESULTS                                     │
├─────────────────────────────────────────────────────────────────────┤
│  x_1310794_founda_0_results                                         │
│                                                                      │
│  ✅ Issues found on sys_user table only                             │
│  ✅ Health score calculated                                         │
│  ✅ Detailed report per VI                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de Données : Option A (Template Complet)

```
1. USER ACTION
   │
   ├─ Choix template: "Complete Table Health Check"
   ├─ Choix table cible: sys_user
   └─ Exécute: mgr.createFromTemplate()
   
2. SYSTEM: READ TEMPLATE
   │
   ├─ Lit template.verification_items (glide_list)
   └─ Trouve: [BR Check, CS Check, UI Actions, ACLs, Notifications]
   
3. SYSTEM: CLONE VIs
   │
   ├─ Pour chaque VI template:
   │  ├─ Clone le VI
   │  ├─ Remplace {0} → sys_user dans query
   │  ├─ Copie issue_rules (glide_list)
   │  └─ Marque is_template = false
   │
   └─ Crée 5 VI instances
   
4. SYSTEM: CREATE CONFIG
   │
   ├─ Crée configuration
   ├─ table = sys_user
   ├─ template = "Complete Table Health Check"
   └─ verification_items = [5 VI instances] (glide_list)
   
5. RESULT
   │
   └─ ✅ Config prête avec 5 VI ciblés sur sys_user
```

---

## 🔄 Flux de Données : Option B (Sélection Manuelle)

```
1. USER ACTION (Dans UI ServiceNow)
   │
   ├─ Crée nouvelle configuration
   ├─ Choix table cible: sys_user
   ├─ use_template = false
   └─ Sélection manuelle VI: "Business Rules Security"
      (via glide_list picker dans UI)
   
2. SYSTEM: CLONE VI
   │
   ├─ Clone le VI template sélectionné
   ├─ Remplace {0} → sys_user dans query
   ├─ Copie issue_rules
   └─ Marque is_template = false
   
3. SYSTEM: LINK TO CONFIG
   │
   └─ config.verification_items = [VI instance] (glide_list)
   
4. RESULT
   │
   └─ ✅ Config avec 1 seul VI (contrôle total)
```

---

## 📋 Comparaison : v2 vs v3

### Architecture v2 (Pattern {0})

```
Template
├─ base_query: "collection={0}^active=true"
├─ template_rules (nouvelle table M2M) ❌
└─ Crée 1 seul VI avec toutes les règles

Limitations:
❌ Nouvelle table template_rules
❌ 1 seul VI par template
❌ Pas de contrôle granulaire
```

### Architecture v3 (glide_list)

```
Template
├─ verification_items (glide_list) ✅ Pas de nouvelle table !
├─ Peut contenir X VI templates
└─ Crée X VI instances (1 par VI template)

Avantages:
✅ Pas de nouvelle table
✅ Plusieurs VI par template
✅ Contrôle granulaire (template OU manuel)
✅ Pattern ServiceNow standard
```

---

## 🎯 Exemple Concret : Cas d'Usage User

### Besoin

> "Je souhaites savoir si les BR sur la table des user sont correct"

### Solution v3

```
┌─────────────────────────────────────────────────────┐
│ 1. CHOIX DU TEMPLATE                                │
│                                                     │
│ Template: "Business Rules Only"                    │
│ └─ verification_items: [Business Rules Check]      │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 2. CLONAGE VI                                       │
│                                                     │
│ VI Template: "Business Rules Check"                │
│ ├─ query: "collection={0}^active=true"             │
│ └─ rules: [BR_HEAVY, HARDCODED_SYSID, ...]         │
│                                                     │
│          ↓ Clone + Replace {0} → sys_user          │
│                                                     │
│ VI Instance: "Business Rules Check - sys_user"     │
│ ├─ query: "collection=sys_user^active=true"        │
│ └─ rules: [BR_HEAVY, HARDCODED_SYSID, ...]         │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 3. CRÉATION CONFIG                                  │
│                                                     │
│ Config: "Users - BR Analysis"                      │
│ ├─ table: sys_user                                 │
│ └─ verification_items: [VI Instance]               │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 4. ANALYSE                                          │
│                                                     │
│ Query exécutée:                                     │
│ "collection=sys_user^active=true^sys_packageISNOTE…│
│                                                     │
│ Résultat:                                           │
│ ✅ Analyse uniquement 23 BR de sys_user             │
│    (pas les 2,543 BR de toute l'instance)          │
│                                                     │
│ Issues détectées:                                   │
│ ├─ BR #1: HARDCODED_SYSID detected                 │
│ ├─ BR #2: BR_HEAVY (150 lines)                     │
│ └─ BR #3: BR_DENSITY too high                      │
└─────────────────────────────────────────────────────┘
```

**Résultat Final** :
- ✅ Rapide (23 BR au lieu de 2,543)
- ✅ Ciblé (uniquement sys_user)
- ✅ Précis (répond exactement à la question)

---

## 📊 Statistiques

### VI Templates Créés

```
8 VI Templates réutilisables
├─ 3 pour Business Rules (complet, performance, security)
├─ 1 pour Client Scripts
├─ 1 pour UI Actions
├─ 1 pour ACLs
├─ 1 pour Notifications
└─ 1 pour Table Records (direct)
```

### Analysis Templates Créés

```
6 Analysis Templates thématiques
├─ 1 Complet (5 VI)
├─ 1 Security (2 VI)
├─ 1 Performance (2 VI)
├─ 1 BR Only (1 VI) ← Votre cas d'usage
├─ 1 CS Only (1 VI)
└─ 1 Quality (2 VI)
```

### Combinaisons Possibles

```
Configurations possibles:
├─ Template complet: 6 templates × N tables = infini
├─ Sélection manuelle: 8 VI × N tables = infini
└─ Combinaisons: Illimité (glide_list multi-select)

Exemples:
├─ sys_user + "Complete Health" = 5 VI
├─ incident + "BR Only" = 1 VI
├─ change_request + Sélection manuelle [BR + CS] = 2 VI
└─ ...
```

---

## ✅ Validation Architecture

### Critères de Réussite

| Critère | v2 | v3 |
|---------|----|----|
| Pas de nouvelle table | ❌ (template_rules) | ✅ |
| Pattern ServiceNow standard | ❌ (custom M2M) | ✅ (glide_list) |
| Multi-VI par template | ❌ | ✅ |
| Contrôle granulaire | ❌ | ✅ |
| Réutilisabilité VI | ❌ | ✅ |
| Maintenance facile | ⚠️ | ✅ |
| Pattern {0} | ✅ | ✅ |
| Analyse ciblée | ✅ | ✅ |

**v3 = Solution Optimale !** 🎉

---

## 🚀 Déploiement

**Suivre** : `DEPLOIEMENT_V3.md` (checklist complète)

**Durée** : ~15 minutes

**Étapes** :
1. ☐ Ajouter 3 champs (5 min)
2. ☐ Déployer FHTemplateManager v3 (2 min)
3. ☐ Peupler templates (1 min)
4. ☐ Tester (7 min)

**Résultat** : Architecture v3 opérationnelle ! 🎯
