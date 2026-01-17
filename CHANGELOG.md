# Changelog

## [1.2.0-doc] - 2026-01-16

### Documentation FHA Widget (277a975c8392f21083e1b4a6feaad318)

**Documentation technique complète** - Mise à jour majeure de la documentation du widget FHA Documentation avec analyse approfondie du code source.

#### Ajouts

- ✨ **Architecture technique détaillée** : Diagrammes MVC, composants serveur/client, flux de données
- ✨ **Documentation CSS complète** : 
  - Palette de couleurs avec codes hex
  - Classes CSS principales (49 classes documentées)
  - Système responsive avec grids adaptatifs
  - Typographie et conventions de nommage
- ✨ **Méthodes publiques documentées** :
  - `setSection(sectionId)` - Gestion manuelle de la section active
  - `scrollToSection(sectionId)` - Navigation avec smooth scroll
  - `goToDashboard()` - Retour au dashboard FHA
- ✨ **Système d'internationalisation** : 
  - Syntaxe `${Label Key}` ServiceNow
  - Plus de 150 labels traduisibles
  - Guide de configuration i18n
- ✨ **Section Scroll Spy détaillée** :
  - Implémentation IntersectionObserver
  - Configuration threshold (35%)
  - Gestion du cycle de vie ($destroy)
  - Fallback pour navigateurs anciens
- ✨ **Cas d'usage pratiques** :
  - Onboarding administrateurs
  - Configuration analyse avancée
  - Intégration API externe
  - Troubleshooting performance
- ✨ **Guide bonnes pratiques** :
  - Pour administrateurs (maintenance, performance, sécurité)
  - Pour développeurs (extension, personnalisation, debugging)
  - Code snippets prêts à l'emploi
- ✨ **Dépendances complètes** :
  - AngularJS, Font Awesome, IntersectionObserver
  - Compatibilité navigateurs (Chrome 58+, Firefox 55+, Safari 12.1+, Edge 16+)
  - Version minimale ServiceNow (Paris+)
- ✨ **Métriques du widget** :
  - Complexité code (~1110 lignes)
  - Performance (< 500ms, ~50 KB)
  - Statistiques sections (10 sections, 14 tableaux, 50 icônes)

#### Améliorations

- 📝 Structure documentaire avec **table des matières complète** (11 sections)
- 📝 Tableaux détaillés pour toutes les données exposées
- 📝 Exemples de code JavaScript/CSS testables
- 📝 Références croisées vers documentation liée
- 📝 Identification précise des fichiers sources (paths complets, tailles)
- 📝 Changelog du widget avec historique des versions

#### Documentation précédente

- Version 1.1.1-doc (2026-01-14) : Documentation basique (52 lignes)
- Version 1.2.0-doc (2026-01-16) : Documentation complète (684 lignes)
- **Ratio d'amélioration** : 13x plus détaillé

#### Fichiers concernés

- `docs/features/widgets/277a975c8392f21083e1b4a6feaad318.md` (mise à jour majeure)
- Source analysée : `d852994c8312321083e1b4a6feaad3e6/update/sp_widget_5ada939c8392f21083e1b4a6feaad360.xml`

---

## [1.1.1-doc] - 2026-01-14

- FHA Documentation widget: scroll-spy (IntersectionObserver) and synchronized navigation
- FHA Documentation widget: version/date read via system properties with fallbacks
- Docs: widget sheet updated (277a975c8392f21083e1b4a6feaad318)

## [1.1.0-doc] - 2026-01-14

- Documentation: FHA Documentation page redesign (Service Portal widget)
- Documentation: added configuration, options, architecture, API sections
- Metadata: added page/widget identifiers and update markers

## [1.1.0] - 2026-01-04

- New: configuration options (deep_scan, include_children_tables, analyze_references)
- New: deep scan - script quality analysis (current.update, hardcoded sys_ids, eval)
- New: children tables analysis with record counts
- New: reference field quality analysis (orphan detection)
- New: integration dependencies mapping (inbound/outbound)
- Improved: table hierarchy support (parents + children)
- Improved: detailed documentation of all options

## [1.0.0] - 2026-01-03

- Initial release
- Table analysis (fields, BR, CS, UI Actions)
- Automation analysis (jobs, flows, workflows, notifications)
- Integration analysis (data sources, transform maps)
- Service Portal dashboard and results page
- REST API endpoints
- PDF/JSON export
- Color-coded type badges
- Filtering for Automation/Integration tabs
