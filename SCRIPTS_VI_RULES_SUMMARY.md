# 📦 Scripts VI + Rules - Résumé Rapide

## 🎯 Fichiers créés

### Scripts d'installation
| Fichier | Description | VI créés | Rules créées |
|---------|-------------|----------|--------------|
| **[scripts/create_vi_client_scripts.js](scripts/create_vi_client_scripts.js)** | Client Scripts anti-patterns | 1 | 5 |
| **[scripts/create_vi_business_rules.js](scripts/create_vi_business_rules.js)** | Business Rules anti-patterns | 1 | 6 |
| **[scripts/create_vi_data_quality.js](scripts/create_vi_data_quality.js)** | Qualité des données | 3 | 5 |

### Documentation
| Fichier | Contenu |
|---------|---------|
| **[GUIDE_VERIFICATION_ITEMS_RULES.md](GUIDE_VERIFICATION_ITEMS_RULES.md)** | Guide complet avec tous les détails et exemples |
| **[scripts/README_VI_RULES.md](scripts/README_VI_RULES.md)** | Mode d'emploi détaillé, cas d'usage, troubleshooting |
| **Ce fichier** | Résumé rapide pour démarrer vite |

---

## ⚡ Quick Start (5 minutes)

### 1. Choisissez votre catégorie

**Option A : Client Scripts** ⭐ Recommandé pour débuter
```
Fichier : scripts/create_vi_client_scripts.js
Détecte : GlideRecord, AJAX sync, hardcoded sys_id, scripts trop longs
Impact : UX, Performance
```

**Option B : Business Rules** 🔴 Critique
```
Fichier : scripts/create_vi_business_rules.js
Détecte : current.update() dans before, async issues, N+1 queries
Impact : Bugs critiques, Performance
```

**Option C : Data Quality** 📊 Valeur Business
```
Fichier : scripts/create_vi_data_quality.js
Détecte : Champs vides, dates incohérentes, doublons
Impact : Qualité des données, Conformité
```

### 2. Exécutez le script

1. Ouvrez ServiceNow
2. **System Definition > Scripts - Background**
3. Copiez-collez le contenu du fichier
4. **Run Script**
5. Vérifiez les logs (✅ = succès)

### 3. Lancez une analyse

1. **Foundation Health Analyzer > Configurations**
2. Créez une nouvelle config
3. Ajoutez le VI créé
4. **Run Analysis**
5. Consultez les résultats dans **Results**

---

## 📊 Ce que vous allez détecter

### Client Scripts (5 règles)
| Code | Détection | Severity | Impact |
|------|-----------|----------|--------|
| CS_GLIDERECORD | GlideRecord côté client | HIGH | Performance, Architecture |
| CS_SYNCHRONOUS_AJAX | getXMLWait() | HIGH | UX (freeze navigateur) |
| CS_HARDCODED_SYSID | sys_id en dur | HIGH | Portabilité |
| CS_LARGE_SCRIPT | >200 lignes | MEDIUM | Maintenabilité |
| CS_NO_CONDITION | onChange sans condition | LOW | Performance |

### Business Rules (6 règles)
| Code | Détection | Severity | Impact |
|------|-----------|----------|--------|
| BR_BEFORE_CURRENT_UPDATE | current.update() dans before | **CRITICAL** | Boucle infinie, Lock DB |
| BR_ASYNC_WITH_CURRENT | current dans async BR | HIGH | Erreur runtime |
| BR_NESTED_GLIDERECORD | Requêtes imbriquées | MEDIUM | Performance (N+1) |
| BR_NO_CONDITION | Pas de condition | LOW | Performance |
| BR_TOO_MANY_QUERIES | >5 queries | MEDIUM | Performance |
| BR_LARGE_SCRIPT | >150 lignes | LOW | Maintenabilité |

### Data Quality (5 règles)
| Code | Détection | Severity | Impact |
|------|-----------|----------|--------|
| DATA_MANDATORY_EMPTY | Champs requis vides | MEDIUM | Qualité données |
| DATA_INCONSISTENT_DATES | Dates incohérentes | MEDIUM | Logique métier |
| DATA_DUPLICATE_EMAIL | Emails en double | HIGH | Sécurité, Unicité |
| DATA_NEVER_UPDATED | Jamais mis à jour >90j | LOW | Données obsolètes |
| DATA_BROKEN_REFERENCE | Références cassées | MEDIUM | Intégrité (placeholder) |

---

## 🎨 Personnalisation rapide

### Modifier les seuils

**Exemple 1 : Scripts plus courts acceptés**
```javascript
// Dans la rule CS_LARGE_SCRIPT, params :
{
  "max_lines": 300,    // Au lieu de 200
  "max_chars": 8000    // Au lieu de 5000
}
```

**Exemple 2 : Champs obligatoires différents**
```javascript
// Dans la rule DATA_MANDATORY_EMPTY, params :
{
  "fields": "priority,category,assignment_group,short_description"
}
```

**Exemple 3 : Plus de requêtes autorisées**
```javascript
// Dans la rule BR_TOO_MANY_QUERIES, params :
{
  "max_queries": 10    // Au lieu de 5
}
```

---

## 📈 Exemple de résultats attendus

### Sur une instance typique

**Client Scripts** (100-200 scripts)
```
✓ Analysés : 156 scripts
✗ Issues : 23
  • HIGH : 8 (GlideRecord: 5, AJAX sync: 3)
  • MEDIUM : 12 (Large: 12)
  • LOW : 3 (No condition: 3)
→ Health Score : 85/100
```

**Business Rules** (200-400 rules)
```
✓ Analysées : 234 rules
✗ Issues : 12
  • CRITICAL : 2 ⚠️ (current.update in before)
  • HIGH : 4 (Async+current: 4)
  • MEDIUM : 5 (Nested: 5)
  • LOW : 1
→ Health Score : 72/100
```

**Data Quality - Incidents** (1000-5000 records)
```
✓ Analysés : 1,234 incidents
✗ Issues : 156
  • MEDIUM : 156 (Empty: 89, Dates: 67)
→ Health Score : 63/100
```

---

## 🚨 Issues critiques à traiter en priorité

### 1. BR_BEFORE_CURRENT_UPDATE (CRITICAL)
**Quoi :** current.update() dans une Business Rule "before"
**Pourquoi c'est grave :** Cause des boucles infinies et lock la base de données
**Que faire :**
1. Identifier la Business Rule
2. Supprimer `current.update()`
3. Les changements sont auto-sauvés dans before
4. Tester immédiatement

### 2. CS_GLIDERECORD (HIGH)
**Quoi :** GlideRecord dans un Client Script
**Pourquoi c'est grave :** Accès DB depuis le navigateur = impossible + mauvaise architecture
**Que faire :**
1. Créer un Script Include avec une fonction
2. Appeler via GlideAjax depuis le Client Script
3. Traiter la réponse dans callback

### 3. DATA_DUPLICATE_EMAIL (HIGH)
**Quoi :** Plusieurs utilisateurs avec le même email
**Pourquoi c'est grave :** Problèmes de sécurité, login, notifications
**Que faire :**
1. Identifier les doublons
2. Fusionner ou désactiver les comptes en double
3. Ajouter une Data Policy pour empêcher les futurs doublons

---

## 💡 Tips

1. **Commencez petit** : 1 catégorie à la fois
2. **Testez sur DEV** avant PROD
3. **Partagez les résultats** avec les équipes
4. **Planifiez les corrections** (ne corrigez pas tout d'un coup)
5. **Re-lancez l'analyse** après corrections pour mesurer l'amélioration

---

## 📞 Support

- 📖 Documentation complète : `GUIDE_VERIFICATION_ITEMS_RULES.md`
- 🔧 Troubleshooting : `scripts/README_VI_RULES.md`
- 💬 Questions ? Ouvrez une issue GitHub

---

**Prêt à démarrer ? Choisissez un script et lancez-le ! 🚀**
