# Guide d'utilisation : Scripts de création VI + Rules

## 📦 Scripts disponibles

### 1. **create_vi_client_scripts.js**
Crée les Verification Items et Rules pour analyser les **Client Scripts**.

**Détecte :**
- ✅ GlideRecord dans Client Scripts (anti-pattern critique)
- ✅ AJAX synchrone (getXMLWait) qui bloque le navigateur
- ✅ sys_id hardcodés dans le code
- ✅ Scripts trop volumineux (>200 lignes ou >5000 chars)
- ✅ Client Scripts onChange sans condition

**Résultat :** 1 VI + 5 Rules

---

### 2. **create_vi_business_rules.js**
Crée les Verification Items et Rules pour analyser les **Business Rules**.

**Détecte :**
- 🔴 current.update() dans before BR (CRITIQUE - cause des boucles infinies)
- ✅ BR async accédant à "current" (indisponible en async)
- ✅ GlideRecord imbriqués (problème N+1)
- ✅ BR sans condition (s'exécute pour tous les records)
- ✅ Trop de requêtes GlideRecord (>5)
- ✅ Scripts trop volumineux (>150 lignes ou >4000 chars)

**Résultat :** 1 VI + 6 Rules

---

### 3. **create_vi_data_quality.js**
Crée les Verification Items et Rules pour analyser la **qualité des données**.

**Détecte :**
- ✅ Champs obligatoires vides (malgré les règles)
- ✅ Dates incohérentes (date de fin avant date de début)
- ✅ Emails en double (doublons dans sys_user)
- ✅ Records jamais mis à jour (>90 jours)
- ⚠️  Références cassées (placeholder à améliorer)

**Résultat :** 3 VI (Incidents, Users, Changes) + 5 Rules

---

## 🚀 Mode d'emploi

### Étape 1 : Exécution dans ServiceNow

1. Connectez-vous à votre instance ServiceNow
2. Naviguez vers **System Definition > Scripts - Background**
3. Copiez-collez le contenu d'un script (ex: `create_vi_client_scripts.js`)
4. Cliquez sur **Run Script**

### Étape 2 : Vérification

Le script affichera dans les logs :
```
===== CRÉATION DES ISSUE RULES =====
Created rule: CS_GLIDERECORD (abc123...)
Created rule: CS_SYNCHRONOUS_AJAX (def456...)
...

===== CRÉATION DU VERIFICATION ITEM =====
Created VI: ghi789...

===== CRÉATION TERMINÉE =====
```

### Étape 3 : Utilisation dans l'analyseur

1. Allez dans **Foundation Health Analyzer > Configurations**
2. Créez une nouvelle Configuration :
   - **Name:** "Client Scripts Analysis"
   - **Table:** sys_script_client
   - **Description:** "Analyse des anti-patterns dans les Client Scripts"

3. Dans l'onglet **Verification Items** :
   - Cliquez sur **Edit**
   - Ajoutez le VI : "Client Scripts - Anti-Patterns & Performance"
   - Sauvegardez

4. Lancez l'analyse :
   - Retournez sur la configuration
   - Cliquez sur **Run Analysis**
   - Attendez que l'analyse se termine

5. Consultez les résultats :
   - Allez dans **Foundation Health Analyzer > Results**
   - Ouvrez le dernier résultat
   - Consultez les issues détectées

---

## 📋 Ordre recommandé d'exécution

### Pour commencer (Quick Start)

**1. Client Scripts** ⭐ RECOMMANDÉ
```javascript
// Exécuter : create_vi_client_scripts.js
```
**Pourquoi ?**
- Facile à tester
- Beaucoup d'anti-patterns courants
- Impact direct sur l'expérience utilisateur

**2. Business Rules** ⭐⭐ CRITIQUE
```javascript
// Exécuter : create_vi_business_rules.js
```
**Pourquoi ?**
- Détecte des bugs critiques (boucles infinies)
- Impact majeur sur les performances
- Problèmes difficiles à déboguer en production

**3. Data Quality** ⭐⭐⭐ VALEUR BUSINESS
```javascript
// Exécuter : create_vi_data_quality.js
```
**Pourquoi ?**
- Valeur business immédiate
- Améliore la qualité des données
- Facilite la prise de décision

### Pour tout exécuter d'un coup

Créez un script composite qui exécute les 3 :

```javascript
// Script composite - Crée TOUS les VI et Rules
(function executeAll() {
    gs.info('========================================');
    gs.info('CRÉATION DE TOUS LES VI ET RULES');
    gs.info('========================================\n');

    // 1. Client Scripts
    gs.info('1/3 - Client Scripts...');
    // Coller ici le contenu de create_vi_client_scripts.js

    // 2. Business Rules
    gs.info('\n2/3 - Business Rules...');
    // Coller ici le contenu de create_vi_business_rules.js

    // 3. Data Quality
    gs.info('\n3/3 - Data Quality...');
    // Coller ici le contenu de create_vi_data_quality.js

    gs.info('\n========================================');
    gs.info('TERMINÉ ! Tous les VI et Rules sont créés.');
    gs.info('========================================');
})();
```

---

## 🎯 Cas d'usage par catégorie

### 🖥️ Client Scripts

**Quand utiliser ?**
- Audit de l'expérience utilisateur
- Optimisation des performances frontend
- Migration vers Service Portal
- Revue de code avant mise en production

**Tables à analyser :**
- `sys_script_client` (tous les Client Scripts)

**Fréquence recommandée :** Mensuelle ou avant chaque release majeure

---

### ⚙️ Business Rules

**Quand utiliser ?**
- Détection de bugs critiques en production
- Optimisation des performances backend
- Audit avant mise à niveau ServiceNow
- Investigation de lenteurs système

**Tables à analyser :**
- `sys_script` (toutes les Business Rules)

**Fréquence recommandée :** Hebdomadaire ou après chaque déploiement

---

### 📊 Data Quality

**Quand utiliser ?**
- Nettoyage de données avant migration
- Audit de conformité (RGPD, etc.)
- Amélioration de la qualité des rapports
- Détection de doublons

**Tables à analyser :**
- `incident` (tickets incidents)
- `sys_user` (utilisateurs)
- `change_request` (demandes de changement)
- `cmdb_ci` (Configuration Items)
- `task` (toutes les tâches)

**Fréquence recommandée :** Mensuelle ou trimestrielle

---

## 🔧 Personnalisation des paramètres

### Modifier les seuils

**Exemple : Changer le seuil de taille des scripts**

1. Allez dans **Foundation Health Analyzer > Issue Rules**
2. Trouvez la règle `CS_LARGE_SCRIPT`
3. Modifiez le champ **Params** :

```json
{
  "max_lines": 300,
  "max_chars": 8000
}
```

**Exemple : Changer les champs obligatoires à vérifier**

1. Trouvez la règle `DATA_MANDATORY_EMPTY`
2. Modifiez **Params** selon votre table :

```json
{
  "fields": "priority,category,short_description,assignment_group"
}
```

### Ajouter des VI pour d'autres tables

Pour créer un VI pour la table `change_request` :

```javascript
var vi = new GlideRecord('x_1310794_founda_0_verification_items');
vi.initialize();
vi.setValue('name', 'Change Requests - Data Quality');
vi.setValue('category', 'quality');
vi.setValue('active', true);

// Référence à la table
var tableGr = new GlideRecord('sys_db_object');
tableGr.addQuery('name', 'change_request');
tableGr.query();
if (tableGr.next()) {
    vi.setValue('table', tableGr.getUniqueValue());
}

vi.setValue('query_value', 'active=true');

// Associer les rules existantes
vi.setValue('issue_rules', 'sys_id_rule1,sys_id_rule2,...');

vi.insert();
```

---

## 📈 Métriques et KPIs

### Après avoir lancé les analyses

Vous pouvez créer des rapports pour suivre :

1. **Nombre d'issues par severity**
   - Critical : à résoudre immédiatement
   - High : à résoudre cette semaine
   - Medium : à planifier
   - Low : backlog

2. **Tendances dans le temps**
   - Nombre d'issues détectées par mois
   - Évolution du health score

3. **Top tables/scripts problématiques**
   - Scripts avec le plus d'anti-patterns
   - Tables avec le plus de problèmes de données

### Exemple de dashboard

```
📊 FOUNDATION HEALTH DASHBOARD

Client Scripts Analysis (Date: 2024-01-15)
├─ Total scripts analysés : 156
├─ Issues détectées : 23
│  ├─ Critical : 0
│  ├─ High : 8 (GlideRecord: 5, AJAX sync: 3)
│  ├─ Medium : 12 (Large scripts: 12)
│  └─ Low : 3 (No condition: 3)
└─ Health Score : 85/100

Business Rules Analysis (Date: 2024-01-15)
├─ Total rules analysées : 234
├─ Issues détectées : 12
│  ├─ Critical : 2 (current.update() in before: 2) ⚠️
│  ├─ High : 4 (Async + current: 4)
│  ├─ Medium : 5 (Nested queries: 5)
│  └─ Low : 1 (No condition: 1)
└─ Health Score : 72/100

Data Quality - Incidents (Date: 2024-01-15)
├─ Total incidents analysés : 1,234
├─ Issues détectées : 156
│  ├─ Medium : 156 (Mandatory empty: 89, Inconsistent dates: 67)
└─ Health Score : 63/100
```

---

## ⚡ Optimisation des performances

### Pour de grandes instances

Si vous avez beaucoup de données :

1. **Limitez le scope initial**
   ```javascript
   vi.setValue('query_value', 'active=true^sys_created_onONLast 30 days@javascript:gs.beginningOfLast30Days()@javascript:gs.endOfLast30Days()');
   ```

2. **Analysez par batch**
   - Créez plusieurs VI avec des filtres différents
   - Exemple : Un VI par catégorie d'incidents

3. **Désactivez les rules lourdes**
   - Désactivez temporairement `DATA_DUPLICATE_EMAIL` si vous avez >100k users
   - Analysez en dehors des heures de pointe

---

## 🐛 Troubleshooting

### "Script timeout error"

**Problème :** Le script prend trop de temps à s'exécuter.

**Solution :**
1. Augmentez le timeout dans System Properties
2. Exécutez les scripts séparément au lieu du script composite
3. Réduisez le scope avec des filtres plus restrictifs

### "Rule not executing"

**Problème :** Une rule ne détecte aucune issue alors qu'il y en a.

**Solution :**
1. Vérifiez que la rule est **active**
2. Vérifiez les **params** (format JSON correct)
3. Testez le script de la rule dans Background Scripts
4. Vérifiez les logs système pour les erreurs

### "VI not appearing in Configuration"

**Problème :** Le VI n'apparaît pas dans la liste.

**Solution :**
1. Vérifiez que le VI est **active**
2. Vérifiez que le champ **table** est bien renseigné
3. Rafraîchissez le cache : `gs.invalidateCache()`
4. Vérifiez que l'utilisateur a les droits suffisants

---

## 📚 Ressources additionnelles

- **Guide complet** : [GUIDE_VERIFICATION_ITEMS_RULES.md](../GUIDE_VERIFICATION_ITEMS_RULES.md)
- **Documentation API** : [DOCUMENTATION_COMPLETE.md](../DOCUMENTATION_COMPLETE.md)
- **Exemples de règles** : Voir le code source dans `scripts/`

---

## 🎓 Bonnes pratiques

1. **Toujours tester sur une instance de dev/test d'abord**
2. **Documenter les paramètres personnalisés**
3. **Créer des sauvegardes avant modifications massives**
4. **Partager les résultats avec les équipes concernées**
5. **Planifier des revues régulières des issues**
6. **Prioriser les issues Critical et High**
7. **Mesurer l'amélioration du health score dans le temps**

---

## 🤝 Contribution

Pour ajouter de nouvelles rules :

1. Suivez le modèle existant dans les scripts
2. Testez sur données de test
3. Documentez les paramètres et cas d'usage
4. Partagez avec la communauté !

---

**Créé le :** 2024-02-10
**Version :** 1.0
**Auteur :** Foundation Health Analyzer Team
