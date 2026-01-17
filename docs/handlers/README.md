# Documentation des Handlers - Index

## 🎯 Par où commencer ?

### Vous êtes...

#### 👤 **Utilisateur final** (Consultant, Analyste)
Vous utilisez FHA pour analyser des instances ServiceNow.

**Commencez par :**
1. 📘 [HANDLERS_REFERENCE.md](./HANDLERS_REFERENCE.md) - Voir tous les handlers disponibles
2. 📖 [SCRIPTS_LIBRARY.md](./SCRIPTS_LIBRARY.md) - Copier des scripts prêts à l'emploi

**Cas d'usage typiques :**
- Je veux créer une nouvelle règle → `HANDLERS_REFERENCE.md`
- Je veux détecter les BR trop lourdes → `SCRIPTS_LIBRARY.md` section "BR Heavy"
- Je veux personnaliser un message → `HANDLERS_REFERENCE.md` section "field_check"

#### ⚙️ **Administrateur** (Admin FHA)
Vous gérez l'installation et la configuration de FHA.

**Commencez par :**
1. 📋 [HANDLERS_REVIEW.md](./HANDLERS_REVIEW.md) - Comprendre l'architecture
2. 🚀 [MIGRATION_GUIDE_v2.md](../MIGRATION_GUIDE_v2.md) - Migrer vers v2.0
3. 🧪 [TESTING_GUIDE_ISSUES.md](../../TESTING_GUIDE_ISSUES.md) - Tester les règles

**Cas d'usage typiques :**
- Je veux migrer mes règles → `MIGRATION_GUIDE_v2.md`
- Je veux comprendre les changements → `HANDLERS_REVIEW.md`
- Je veux tester avant production → `TESTING_GUIDE_ISSUES.md`

#### 👨‍💻 **Développeur** (Customization)
Vous développez des handlers personnalisés ou modifiez le code.

**Commencez par :**
1. 🏗️ [aggregate-handlers.md](../patterns/aggregate-handlers.md) - Pattern d'agrégation
2. 🔧 [HANDLERS_REFERENCE.md](./HANDLERS_REFERENCE.md) - API complète
3. 📝 [SCRIPTS_LIBRARY.md](./SCRIPTS_LIBRARY.md) - Exemples de code

**Cas d'usage typiques :**
- Je veux créer un handler agrégé → `aggregate-handlers.md`
- Je veux comprendre l'API → `HANDLERS_REFERENCE.md`
- Je veux voir des exemples → `SCRIPTS_LIBRARY.md`

---

## 📚 Structure de la documentation

```
Foundation-Health-Analyzer/
│
├── docs/
│   ├── handlers/
│   │   ├── README.md                    ← Vous êtes ici
│   │   ├── HANDLERS_REVIEW.md           ← Analyse complète des handlers
│   │   ├── HANDLERS_REFERENCE.md        ← Référence API complète
│   │   └── SCRIPTS_LIBRARY.md           ← Bibliothèque de scripts
│   │
│   ├── patterns/
│   │   └── aggregate-handlers.md        ← Pattern d'agrégation
│   │
│   ├── MIGRATION_GUIDE_v2.md            ← Guide de migration
│   └── features/
│       └── issue-rules.md               ← Documentation des règles
│
├── CHANGELOG_HANDLERS_v2.md             ← Changelog détaillé
├── CHANGELOG_ISSUES_AGGREGATION.md      ← Fix des duplicatas
└── TESTING_GUIDE_ISSUES.md              ← Guide de test
```

---

## 🗂️ Index par sujet

### Handlers

| Document | Description | Audience |
|----------|-------------|----------|
| [HANDLERS_REFERENCE.md](./HANDLERS_REFERENCE.md) | Référence complète de tous les handlers avec paramètres et exemples | Tous |
| [HANDLERS_REVIEW.md](./HANDLERS_REVIEW.md) | Analyse et recommandations pour chaque handler | Admin, Dev |

### Scripts personnalisés

| Document | Description | Audience |
|----------|-------------|----------|
| [SCRIPTS_LIBRARY.md](./SCRIPTS_LIBRARY.md) | 15+ scripts réutilisables par catégorie | Tous |

### Patterns et Architecture

| Document | Description | Audience |
|----------|-------------|----------|
| [aggregate-handlers.md](../patterns/aggregate-handlers.md) | Pattern pour handlers agrégés (éviter duplicatas) | Dev |

### Migration et Mise à jour

| Document | Description | Audience |
|----------|-------------|----------|
| [MIGRATION_GUIDE_v2.md](../MIGRATION_GUIDE_v2.md) | Guide pas à pas pour migrer vers v2.0 | Admin |
| [CHANGELOG_HANDLERS_v2.md](../../CHANGELOG_HANDLERS_v2.md) | Liste complète des changements v2.0 | Admin, Dev |
| [CHANGELOG_ISSUES_AGGREGATION.md](../../CHANGELOG_ISSUES_AGGREGATION.md) | Fix des 86 issues duplicatas | Admin |

### Tests

| Document | Description | Audience |
|----------|-------------|----------|
| [TESTING_GUIDE_ISSUES.md](../../TESTING_GUIDE_ISSUES.md) | Guide pour tester les règles et handlers | Admin, Dev |

---

## 🚀 Guides rapides

### Guide rapide : Créer une nouvelle règle

1. **Choisir le type de vérification**
   - Vérification simple sur un champ → Utiliser `field_check`
   - Scan de pattern dans le code → Utiliser `pattern_scan`
   - Logique complexe → Utiliser un script personnalisé

2. **Trouver un exemple**
   - Parcourir [SCRIPTS_LIBRARY.md](./SCRIPTS_LIBRARY.md)
   - Ou voir les exemples dans [HANDLERS_REFERENCE.md](./HANDLERS_REFERENCE.md)

3. **Créer la règle**
   - Naviguer vers `Foundation Health Analyzer > Issue Rules`
   - Créer un nouvel enregistrement
   - Remplir les champs selon l'exemple
   - Sauvegarder

4. **Tester**
   - Créer un Verification Item qui utilise cette règle
   - Lancer une analyse
   - Vérifier les résultats

### Guide rapide : Migrer une règle existante

1. **Identifier la règle à migrer**
   - Voir [MIGRATION_GUIDE_v2.md](../MIGRATION_GUIDE_v2.md) section "Handlers à migrer"

2. **Trouver le script de remplacement**
   - Chercher dans [SCRIPTS_LIBRARY.md](./SCRIPTS_LIBRARY.md)
   - Copier le script approprié

3. **Appliquer la migration**
   - Ouvrir la règle dans ServiceNow
   - Coller le script dans le champ `script`
   - Optionnel : Vider le champ `type`
   - Sauvegarder

4. **Tester**
   - Relancer l'analyse
   - Vérifier que les issues sont toujours générées
   - Vérifier que les messages sont améliorés

### Guide rapide : Débugger une règle

1. **Activer les logs**
```javascript
// Ajouter au début du script
gs.info('=== DEBUG RULE: ' + rule.code + ' ===');
gs.info('Item: ' + JSON.stringify(item.values));
```

2. **Vérifier les logs**
   - Aller dans `System Logs`
   - Filtrer par `[FHARuleEvaluator]` ou votre message de debug

3. **Problèmes courants**
   - **Pas d'issue générée** : Vérifier la condition, les champs disponibles
   - **Erreur de script** : Vérifier la syntaxe JavaScript
   - **Issues dupliquées** : Utiliser le pattern d'agrégation (voir `aggregate-handlers.md`)

---

## 📖 Glossaire

- **Handler** : Fonction qui évalue un enregistrement et retourne des issues
- **Rule** : Configuration d'un handler (type, paramètres, sévérité)
- **Verification Item** : Requête qui récupère des enregistrements + règles à appliquer
- **Issue** : Problème détecté par un handler
- **Context** : Objet partagé entre tous les appels de handlers (pour agrégation)
- **Aggregate Handler** : Handler qui ne déclenche qu'une fois par dataset (ex: `br_density`)
- **Individual Handler** : Handler qui évalue chaque enregistrement (ex: `inactive`)

---

## 🔗 Liens utiles

### Documentation externe
- [ServiceNow Developer Portal](https://developer.servicenow.com/)
- [GlideRecord API](https://developer.servicenow.com/dev.do#!/reference/api/tokyo/server/no-namespace/c_GlideRecordScopedAPI)
- [JavaScript Best Practices](https://developer.servicenow.com/dev.do#!/learn/learning-plans/tokyo/new_to_servicenow/app_store_learnv2_scripting_tokyo_scripting_in_servicenow)

### Documentation interne
- [README principal](../../README.md)
- [Architecture générale](../features/architecture.md)
- [API Documentation](../api/)

---

## 💬 Support

### Questions fréquentes

**Q: Puis-je utiliser plusieurs handlers sur une même règle ?**  
R: Oui, mais le champ `type` ne peut avoir qu'un handler. Utilisez plutôt un script personnalisé qui combine plusieurs logiques.

**Q: Comment éviter les issues dupliquées ?**  
R: Pour les handlers agrégés, utilisez le pattern d'agrégation décrit dans `aggregate-handlers.md`.

**Q: Mes scripts sont trop longs, que faire ?**  
R: Créez un Script Include avec des fonctions utilitaires et appelez-le depuis votre script de règle.

**Q: Comment partager mes scripts avec l'équipe ?**  
R: Ajoutez-les dans `SCRIPTS_LIBRARY.md` via une pull request ou ticket.

### Obtenir de l'aide

1. **Documentation** : Chercher dans les docs ci-dessus
2. **Logs** : Vérifier les logs dans System Logs
3. **Support** : Créer un ticket avec tag `handlers-v2`
4. **Communauté** : Consulter les forums internes

---

## 🎓 Formation

### Parcours recommandé

#### Niveau Débutant (2h)
1. Lire [HANDLERS_REFERENCE.md](./HANDLERS_REFERENCE.md) - Vue d'ensemble
2. Copier/tester 2-3 scripts de [SCRIPTS_LIBRARY.md](./SCRIPTS_LIBRARY.md)
3. Créer sa première règle personnalisée

#### Niveau Intermédiaire (4h)
1. Lire [HANDLERS_REVIEW.md](./HANDLERS_REVIEW.md) - Comprendre l'architecture
2. Suivre [MIGRATION_GUIDE_v2.md](../MIGRATION_GUIDE_v2.md) - Migrer 5-10 règles
3. Créer des scripts personnalisés avancés

#### Niveau Avancé (8h)
1. Lire [aggregate-handlers.md](../patterns/aggregate-handlers.md) - Maîtriser l'agrégation
2. Créer un nouveau handler générique
3. Contribuer à la bibliothèque de scripts

### Ateliers disponibles

- **Workshop 1** : "Créer ses premières règles" (1h)
- **Workshop 2** : "Migration vers v2.0" (1h30)
- **Workshop 3** : "Handlers avancés et patterns" (2h)

---

## 📊 Métriques

### Couverture documentaire

- **Handlers documentés** : 32/32 (100%)
- **Scripts d'exemple** : 15+ scripts réutilisables
- **Guides de migration** : 3 exemples complets
- **Patterns documentés** : 1 (agrégation)

### Utilisation (à remplir)

- **Règles migrées** : 0/50 (0%)
- **Scripts personnalisés créés** : 0
- **Handlers v2 utilisés** : 0

---

## 🗺️ Roadmap

### Version 2.1 (Q2 2026)
- [ ] Handler `cs_density` (comme `br_density` pour Client Scripts)
- [ ] Handler `field_aggregate` (sum, avg, max, min)
- [ ] Amélioration de `aggregate_metric` avec support de sum/avg
- [ ] 10 nouveaux scripts dans la bibliothèque

### Version 3.0 (Q3 2026)
- [ ] Interface graphique pour créer des règles
- [ ] Assistant IA pour générer des scripts
- [ ] Marketplace de scripts communautaires
- [ ] Support des webhooks pour notifications

---

**Dernière mise à jour** : 2026-01-16  
**Version** : 2.0.0  
**Mainteneur** : Wilfried Waret
