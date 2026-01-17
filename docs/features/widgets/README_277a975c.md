# Guide Rapide - Widget FHA Documentation

**Widget ID** : `277a975c8392f21083e1b4a6feaad318`  
**Version** : 1.2.0-doc  
**Dernière mise à jour** : 2026-01-16

---

## 🎯 Accès rapide

### Pour les utilisateurs

| Besoin | Fichier | Section |
|--------|---------|---------|
| **Accéder au widget** | - | URL: `/fha?id=fha_documentation` |
| **Comprendre le widget** | [Documentation principale](277a975c8392f21083e1b4a6feaad318.md) | § Description |
| **Configurer le widget** | [Documentation principale](277a975c8392f21083e1b4a6feaad318.md) | § Configuration |
| **Voir les options d'analyse** | [Documentation principale](277a975c8392f21083e1b4a6feaad318.md) | § Fonctionnalités |
| **Exemples d'utilisation** | [Documentation principale](277a975c8392f21083e1b4a6feaad318.md) | § Cas d'usage |

### Pour les développeurs

| Besoin | Fichier | Section |
|--------|---------|---------|
| **Architecture technique** | [Documentation principale](277a975c8392f21083e1b4a6feaad318.md) | § Architecture technique |
| **Diagramme d'architecture** | [Diagramme Mermaid](277a975c_architecture.mmd) | Tout le fichier |
| **Flux d'exécution** | [Diagramme séquence](277a975c_sequence.mmd) | Tout le fichier |
| **Classes CSS** | [Documentation principale](277a975c8392f21083e1b4a6feaad318.md) | § Styling et CSS |
| **Méthodes API** | [Documentation principale](277a975c8392f21083e1b4a6feaad318.md) | § Configuration |
| **Personnalisation** | [Documentation principale](277a975c8392f21083e1b4a6feaad318.md) | § Bonnes pratiques |
| **Code source** | `d852994c8312321083e1b4a6feaad3e6/update/sp_widget_5ada939c8392f21083e1b4a6feaad360.xml` | - |

### Pour les mainteneurs

| Besoin | Fichier |
|--------|---------|
| **Historique des changements** | [CHANGELOG.md](../../../CHANGELOG.md) (section 1.2.0-doc) |
| **Rapport de mise à jour** | [DOCUMENTATION_UPDATE_277a975c.md](../../../DOCUMENTATION_UPDATE_277a975c.md) |
| **Guide de ce dossier** | Ce fichier (README_277a975c.md) |

---

## 📦 Contenu du dossier

```
docs/features/widgets/
├── 277a975c8392f21083e1b4a6feaad318.md     ← Documentation principale (684 lignes)
├── 277a975c_architecture.mmd                ← Diagramme architecture Mermaid
├── 277a975c_sequence.mmd                    ← Diagramme séquence Mermaid
├── README_277a975c.md                       ← Ce fichier (guide rapide)
└── analysis-detail.md                       ← Autre widget (non lié)
```

---

## 🔍 Structure de la documentation principale

### Sections disponibles (11 au total)

1. **Description** (50 lignes)
   - Résumé rapide
   - Emplacement des fichiers
   
2. **Architecture technique** (200 lignes)
   - Vue d'ensemble MVC
   - Server Script détaillé
   - Client Script détaillé
   - Template HTML

3. **Configuration** (80 lignes)
   - Paramètres du widget
   - System Properties
   - Accès et permissions

4. **Fonctionnalités** (90 lignes)
   - Navigation intelligente
   - Scroll Spy automatique
   - Affichage métadonnées
   - Retour au dashboard

5. **Navigation et UX** (70 lignes)
   - Structure de navigation (10 sections)
   - Expérience utilisateur

6. **Styling et CSS** (180 lignes)
   - Palette de couleurs
   - 49 classes CSS documentées
   - Responsive design
   - Typographie

7. **Internationalisation** (80 lignes)
   - Système de labels
   - 150+ labels traduisibles
   - Configuration i18n

8. **Cas d'usage** (120 lignes)
   - Onboarding administrateurs
   - Configuration analyse avancée
   - Intégration API externe
   - Troubleshooting

9. **Bonnes pratiques** (100 lignes)
   - Pour administrateurs
   - Pour développeurs
   - Code snippets

10. **Dépendances** (80 lignes)
    - Frameworks et bibliothèques
    - Compatibilité navigateurs
    - Dépendances ServiceNow

11. **Références** (50 lignes)
    - Fichiers sources
    - Documentation liée
    - Métriques du widget

**Total** : ~1100 lignes de documentation technique

---

## 🚀 Quick Start

### Je veux utiliser le widget

1. **Accéder** : `/fha?id=fha_documentation`
2. **Naviguer** : Utiliser la barre de navigation sticky
3. **Lire** : Consulter les sections selon vos besoins

### Je veux comprendre le code

1. **Lire** : [Architecture technique](277a975c8392f21083e1b4a6feaad318.md#architecture-technique)
2. **Visualiser** : Ouvrir [diagramme architecture](277a975c_architecture.mmd) dans un viewer Mermaid
3. **Suivre le flux** : Ouvrir [diagramme séquence](277a975c_sequence.mmd)
4. **Analyser** : Lire le fichier XML source (`sp_widget_5ada939c8392f21083e1b4a6feaad360.xml`)

### Je veux personnaliser le widget

1. **Lire** : [Bonnes pratiques § Développeurs](277a975c8392f21083e1b4a6feaad318.md#bonnes-pratiques)
2. **CSS** : Consulter [Styling et CSS](277a975c8392f21083e1b4a6feaad318.md#styling-et-css)
3. **Extension** : Voir exemples de code pour ajouter des sections
4. **Tester** : Modifier et tester dans votre instance

### Je veux maintenir la documentation

1. **Comprendre** : Lire [Rapport de mise à jour](../../../DOCUMENTATION_UPDATE_277a975c.md)
2. **Modifier** : Éditer [277a975c8392f21083e1b4a6feaad318.md](277a975c8392f21083e1b4a6feaad318.md)
3. **Versionner** : Mettre à jour [CHANGELOG.md](../../../CHANGELOG.md)
4. **Valider** : Vérifier avec les linters Markdown

---

## 📊 Métriques rapides

| Métrique | Valeur |
|----------|--------|
| **Lignes de documentation** | 684 |
| **Sections principales** | 11 |
| **Tableaux techniques** | 20+ |
| **Exemples de code** | 12+ |
| **Classes CSS documentées** | 49 |
| **Méthodes documentées** | 7 |
| **Diagrammes Mermaid** | 2 |

---

## 🎓 Concepts clés

### MVC Architecture

```
Template (View) → Client Script (Controller) → Server Script (Model)
     ↓                     ↓                           ↓
  HTML/CSS          AngularJS Methods         System Properties
```

### Composants principaux

| Composant | Description | Lignes de code |
|-----------|-------------|----------------|
| **Server Script** | Lecture system properties, exposition données | 7 lignes |
| **Client Script** | Gestion navigation, scroll spy | 63 lignes |
| **Template** | HTML avec 10 sections documentaires | 551 lignes |
| **CSS** | Styles inline, responsive design | 490 lignes |

### Méthodes publiques

```javascript
// Navigation manuelle
c.setSection(sectionId)

// Scroll smooth vers section
c.scrollToSection(sectionId)

// Retour au dashboard
c.goToDashboard()
```

### Données exposées

```javascript
data = {
    appVersion: '1.1.0',           // Version FHA
    lastUpdated: '2026-01-14',     // Date mise à jour
    pageId: '277a975c...',         // sys_id page
    widgetId: '5ada939c...'        // sys_id widget
}
```

---

## 🛠️ Outils recommandés

### Pour visualiser les diagrammes Mermaid

| Outil | URL/App | Notes |
|-------|---------|-------|
| **Mermaid Live Editor** | https://mermaid.live | Éditeur en ligne, export PNG/SVG |
| **VS Code Extension** | Mermaid Preview | Preview dans l'éditeur |
| **GitHub/GitLab** | Natif | Rendering automatique des .mmd |
| **Obsidian** | Plugin Mermaid | Si vous utilisez Obsidian |

### Pour éditer la documentation

| Outil | Recommandé pour | Notes |
|-------|-----------------|-------|
| **VS Code** | Édition générale | Extensions Markdown, linters |
| **Cursor** | Édition assistée IA | Pour modifications complexes |
| **Typora** | Édition visuelle | WYSIWYG Markdown |
| **Obsidian** | Navigation liée | Si vous gérez beaucoup de docs |

---

## 📚 Références externes

### ServiceNow Documentation

- [Service Portal Widgets](https://docs.servicenow.com/bundle/vancouver-servicenow-platform/page/build/service-portal/concept/c_WidgetDevelopment.html)
- [AngularJS in Service Portal](https://docs.servicenow.com/bundle/vancouver-servicenow-platform/page/build/service-portal/concept/c_AngularJSInServicePortal.html)
- [System Properties](https://docs.servicenow.com/bundle/vancouver-application-development/page/administer/managing-system-properties/concept/system-properties.html)

### Standards Web

- [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [AngularJS v1.7](https://docs.angularjs.org/api)
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)

### Diagrammes

- [Mermaid Syntax](https://mermaid.js.org/intro/)
- [Graph Diagrams](https://mermaid.js.org/syntax/flowchart.html)
- [Sequence Diagrams](https://mermaid.js.org/syntax/sequenceDiagram.html)

---

## ✅ Checklist d'utilisation

### Premier usage

- [ ] Lire la section "Description" pour comprendre le contexte
- [ ] Vérifier l'accès : `/fha?id=fha_documentation`
- [ ] Tester la navigation entre les sections
- [ ] Consulter la section pertinente à vos besoins

### Développement

- [ ] Lire "Architecture technique" en entier
- [ ] Visualiser les diagrammes Mermaid
- [ ] Analyser le fichier XML source
- [ ] Tester les méthodes publiques dans la console

### Maintenance

- [ ] Lire le rapport de mise à jour
- [ ] Comprendre le système de versioning
- [ ] Mettre à jour CHANGELOG à chaque changement
- [ ] Synchroniser system properties avec la documentation

---

## 🐛 Troubleshooting

### Le widget ne s'affiche pas

1. Vérifier les rôles : `x_1310794_founda_0.admin` ou `.user`
2. Vérifier que Service Portal est activé
3. Vérifier l'URL : `/fha?id=fha_documentation`
4. Consulter les logs serveur (si `x_1310794_founda_0.debug = true`)

### Le scroll spy ne fonctionne pas

1. Ouvrir la console navigateur
2. Vérifier `IntersectionObserver` supporté : `'IntersectionObserver' in window`
3. Si false → navigateur ancien, scroll spy désactivé (comportement normal)
4. Navigation manuelle reste fonctionnelle

### Les system properties ne sont pas lues

1. Vérifier que les propriétés existent :
   - `x_1310794_founda_0.version`
   - `x_1310794_founda_0.doc.last_updated`
2. Si absentes → fallbacks utilisés (`1.1.0`, `2026-01-14`)
3. Créer les propriétés si nécessaire

### Problèmes CSS

1. Vérifier qu'il n'y a pas de conflits avec un theme personnalisé
2. Consulter la section "Styling et CSS" pour les classes
3. Utiliser les DevTools navigateur pour inspecter
4. Créer des overrides CSS si besoin (voir bonnes pratiques)

---

## 📞 Support

### Questions sur le widget

1. **Documentation** : Lire [277a975c8392f21083e1b4a6feaad318.md](277a975c8392f21083e1b4a6feaad318.md)
2. **Diagrammes** : Consulter les fichiers .mmd
3. **Code source** : Analyser le XML du widget

### Questions sur FHA

1. **Architecture globale** : `docs/architecture.md`
2. **API REST** : `docs/api/endpoints.md`
3. **Workflow** : `docs/features/analysis-workflow.md`

### Signaler un problème

1. **Bug dans le widget** : Contacter l'équipe FHA (`x_1310794_founda_0.admin`)
2. **Erreur dans la doc** : Ouvrir une issue ou PR sur le repo
3. **Suggestion d'amélioration** : Même processus

---

## 🔄 Changelog de ce README

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0.0 | 2026-01-16 | Création du README après mise à jour documentation |

---

**Maintenu par** : Foundation Health Analyzer Team  
**Dernière mise à jour** : 2026-01-16  
**Statut** : ✅ À jour (synchronisé avec version 1.2.0-doc)

---

## 🎉 À retenir

Ce widget est une **documentation in-app** complète pour FHA. Il contient :

- ✅ **10 sections** documentaires couvrant tous les aspects
- ✅ **Navigation intelligente** avec scroll spy automatique
- ✅ **Responsive design** pour tous les écrans
- ✅ **Internationalisation** native ServiceNow (150+ labels)
- ✅ **Performance optimale** (< 500ms, pas d'API externe)

**Commencez ici** : `/fha?id=fha_documentation` 🚀
