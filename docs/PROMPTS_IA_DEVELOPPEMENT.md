# 🤖 Prompts IA pour Accélérer le Développement FHA
**Foundation Health Analyzer - Prompts Optimisés pour IA**

---

## 📋 Comment Utiliser Ce Document

1. **Copiez le prompt** de la section correspondante
2. **Collez-le dans votre IA** (Claude, Cursor AI recommandés - accès aux fichiers)
3. **L'IA va lire et modifier les fichiers XML directement**
4. **Vous validez et testez** dans votre instance ServiceNow
5. **Commit et passez au suivant**

**⚠️ Important** : 
- Utilisez une IA qui peut **lire et écrire des fichiers** (Claude, Cursor AI)
- Les prompts sont conçus pour que l'IA **fasse les modifications directement**
- Vous n'avez qu'à **valider et tester** le résultat

---

## 🎯 PHASE 1 : NETTOYAGE DU CODE

### Prompt 1.1 : Identifier les Composants Obsolètes

```
Je développe une application ServiceNow appelée Foundation Health Analyzer (scope: x_1310794_founda_0).

CONTEXTE :
- Chemin du projet : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/
- Dossier update : d852994c8312321083e1b4a6feaad3e6/update/

J'ai identifié 9 Script Includes marqués comme inactifs qui doivent être supprimés :
1. FHCheckTable
2. FHCheckAutomation
3. FHCheckIntegration
4. FHCheckSecurity
5. FHCheckRegistry
6. FHAnalysisContext
7. FHOptionsHandler
8. FHScanUtils
9. FHAUtils

TÂCHE :
1. **CHERCHE** dans le dossier d'update/update tous les fichiers XML de Script Includes
2. **IDENTIFIE** lesquels des 9 sont marqués <active>false</active>
3. **CHERCHE** toutes les références à ces classes dans les autres Script Includes actifs
4. **CRÉE** un nouveau fichier "CLEANUP_REPORT_STEP1.md" avec le rapport détaillé

ACTIONS À FAIRE :
- Utilise grep ou read_file pour trouver les fichiers
- Parse les XML pour vérifier le statut active
- Cherche les références dans les autres fichiers
- Génère le rapport dans un fichier Markdown

**NE ME RETOURNE PAS JUSTE DU CODE - FAIS LES ACTIONS DIRECTEMENT !**
```

---

### Prompt 1.2 : Supprimer les Composants Obsolètes

```
Basé sur le rapport CLEANUP_REPORT_STEP1.md, je veux supprimer les Script Includes obsolètes.

CONTEXTE :
- Chemin : d852994c8312321083e1b4a6feaad3e6/update/
- Les 9 Script Includes à supprimer ont été identifiés dans l'étape précédente

TÂCHE :
1. **LIS** le fichier CLEANUP_REPORT_STEP1.md pour identifier les fichiers à supprimer
2. **POUR CHAQUE** Script Include obsolète :
   - Vérifie qu'il est bien marqué <active>false</active>
   - **SUPPRIME** le fichier XML correspondant
   - **LOG** dans un fichier CLEANUP_ACTIONS.md
3. **CRÉE** un backup des fichiers supprimés dans un dossier archive/cleanup-2026-01-17/
4. **GÉNÈRE** un script Background ServiceNow dans CLEANUP_SCRIPT.js pour référence

EXIGENCES :
- Backup AVANT suppression
- Ne supprimer QUE si active=false
- Logger chaque action

**FAIS LES SUPPRESSIONS DIRECTEMENT - Ne me retourne pas juste du code !**

Une fois terminé, je pourrai commit les changements et tester l'application.
```

---

### Prompt 1.3 : Nettoyer le Dossier author_elective_update

```
Mon application ServiceNow contient un dossier "author_elective_update" avec des composants de développement qui ne sont pas en production.

CONTEXTE :
- Chemin : d852994c8312321083e1b4a6feaad3e6/author_elective_update/
- Contient ~143 fichiers XML
- Ce sont des composants créés pendant le développement mais non utilisés

TÂCHE :
Crée-moi un script bash/shell qui :
1. Crée un dossier "archive/2026-01-17/"
2. Déplace le dossier "author_elective_update" vers l'archive
3. Crée un fichier README.txt dans l'archive expliquant ce qui a été archivé
4. Génère un rapport de ce qui a été déplacé

EXIGENCES :
- Script sécurisé (vérifier que les dossiers existent)
- Créer un backup avant déplacement
- Logs détaillés

Retourne le script bash complet.
```

---

### Prompt 1.4 : Update Set de Cleanup

```
Je viens de supprimer 9 Script Includes obsolètes de mon application ServiceNow.

TÂCHE :
Crée-moi la documentation pour créer un Update Set de cleanup contenant :
1. Les étapes pour créer l'Update Set
2. Ce qu'il doit contenir
3. Comment le tester
4. Comment le rollback si nécessaire

Fournis aussi un script Background qui génère un rapport de tous les composants qui ont été supprimés pour documentation.

FORMAT : Documentation step-by-step + script.
```

---

## 🎨 PHASE 2 : REFONTE CSS & THÈME

### Prompt 2.1 : Audit CSS Actuel

```
Je veux refaire le CSS de mon application ServiceNow Service Portal (Foundation Health Analyzer).

CONTEXTE :
- Application : FHA (Foundation Health Analyzer)
- 4 widgets principaux :
  1. FHA Dashboard (fha_dashboard)
  2. FHA Analysis Detail (fha_analysis_detail)
  3. FHA Documentation (fha-documentation)
  4. FHA Analysis Results (legacy)

TÂCHE :
Crée-moi un checklist d'audit CSS pour identifier :
1. Les couleurs actuellement utilisées (extraire la palette)
2. Les tailles de police (font-sizes)
3. Les espacements (margins, paddings)
4. Les composants Bootstrap utilisés
5. Les classes CSS custom
6. Les incohérences de style
7. Les problèmes d'accessibilité

FORMAT :
- Checklist interactive (cases à cocher)
- Pour chaque point, indiquer où chercher dans le code
- Proposer des outils pour l'audit (DevTools, etc.)

Retourne la checklist complète.
```

---

### Prompt 2.2 : Design System Moderne

```
Je veux créer un Design System moderne pour mon application ServiceNow.

CONTEXTE :
- Application : Foundation Health Analyzer (FHA)
- Thème actuel : Bootstrap par défaut
- Objectif : Look moderne, professionnel, tech-savvy

TÂCHE :
**CRÉE directement** les fichiers suivants :

1. **docs/design-system/DESIGN_SYSTEM.md** - Documentation complète
2. **docs/design-system/variables.css** - Variables CSS
3. **docs/design-system/components.css** - Styles des composants
4. **docs/design-system/utilities.css** - Classes utilitaires
5. **docs/design-system/examples.html** - Exemples visuels

CONTENU DU DESIGN SYSTEM :
- **PALETTE DE COULEURS** : Primaire, secondaire, statuts, sévérités, dégradés
- **TYPOGRAPHIE** : Polices, échelle, line-heights
- **ESPACEMENTS** : Système 4px/8px/16px/24px/32px
- **COMPOSANTS** : Boutons, Cards, Badges, Tables, Forms
- **ANIMATIONS** : Transitions, loading, hover

INSPIRATION :
- Tailwind CSS
- Material Design 3
- GitHub Dark Theme
- Notion

**CRÉE CES 5 FICHIERS DIRECTEMENT - Ne me retourne pas juste du code !**

Je pourrai ensuite appliquer ces styles aux widgets ServiceNow.
```

---

### Prompt 2.3 : CSS pour Widget Dashboard

```
Je veux refaire le CSS de mon widget "FHA Dashboard".

CONTEXTE :
- Widget ID : fha_dashboard
- Fichier à modifier : d852994c8312321083e1b4a6feaad3e6/update/sp_widget_223611488392321083e1b4a6feaad3db.xml
- Design System créé : docs/design-system/

TÂCHE :
1. **LIS** le fichier XML du widget Dashboard
2. **LIS** le Design System (docs/design-system/variables.css)
3. **EXTRAIT** la section CSS du widget (balise <css>)
4. **RÉÉCRIS** le CSS en utilisant le Design System avec :
   - Layout moderne (Flexbox/Grid)
   - Dropdown stylisé
   - Bouton "Run Analysis" avec effets
   - Cards pour analyses récentes
   - Responsive design
   - Transitions fluides
5. **MODIFIE** le fichier XML en remplaçant l'ancien CSS
6. **CRÉE** un fichier CHANGELOG_CSS_DASHBOARD.md documentant les changements

EXIGENCES :
- Utiliser les variables du Design System
- Compatible Bootstrap 4
- Code commenté

**MODIFIE LE FICHIER XML DIRECTEMENT - Ne me retourne pas juste du CSS !**

Après, je pourrai importer le widget dans ServiceNow et tester.
```

---

### Prompt 2.4 : CSS pour Widget Analysis Detail

```
Je veux refaire le CSS de mon widget "FHA Analysis Detail".

CONTEXTE :
- Widget ID : fha_analysis_detail
- Contient : Tabs (Overview, Issues, JSON), filtres, search, table d'issues, badges

DESIGN SYSTEM (colle ici le résultat du Prompt 2.2)

TÂCHE :
Crée-moi le CSS complet pour :
1. Tabs modernes avec indicateur actif
2. Filtres (dropdowns et search bar)
3. Table d'issues avec tri et hover
4. Badges de sévérité (high/medium/low) avec couleurs
5. Badges de type (automation, integration, etc.)
6. Boutons d'action (export, etc.)
7. États vides (no data)
8. Loading states

EXIGENCES :
- Utiliser le Design System du Prompt 2.2
- Smooth transitions
- Accessible (ARIA, keyboard navigation)
- Dark mode ready (optionnel)

Retourne le CSS complet avec exemples HTML.
```

---

### Prompt 2.5 : CSS pour Widget Documentation

```
Je veux moderniser le CSS de mon widget "FHA Documentation".

CONTEXTE :
- Widget ID : fha-documentation
- Contient : Navigation sticky, 10 sections, scroll-spy, code blocks

DESIGN SYSTEM (colle ici le résultat du Prompt 2.2)

TÂCHE :
Crée-moi le CSS pour :
1. Navigation sticky moderne (sidebar ou top-bar)
2. Sections avec smooth scroll
3. Code blocks avec syntax highlighting
4. Tables responsive
5. Callouts/Alerts (info, warning, success)
6. Breadcrumbs
7. Table of contents interactive

INSPIRATION :
- Documentation de Stripe
- Documentation de Tailwind CSS
- GitBook

Retourne le CSS complet.
```

---

### Prompt 2.6 : Thème Sombre (Optionnel)

```
Je veux ajouter un mode sombre à mon application FHA.

CONTEXTE :
- J'ai déjà créé mon Design System avec le Prompt 2.2
- Je veux un toggle dark/light mode

TÂCHE :
Crée-moi :
1. Variables CSS pour le mode sombre
2. JavaScript pour toggle le mode
3. Stockage de la préférence (localStorage)
4. Respect de la préférence système (prefers-color-scheme)
5. Transition douce entre les modes

EXIGENCES :
- Pas de flash lors du chargement
- Respect du contraste (accessibilité)
- Toutes les couleurs adaptées

Retourne le code CSS + JS complet.
```

---

## ⚙️ PHASE 3 : AMÉLIORATION DES FONCTIONNALITÉS

### Prompt 3.1 : Analyse UX des Fonctionnalités Actuelles

```
Je veux améliorer l'UX de mon application ServiceNow Foundation Health Analyzer.

CONTEXTE :
- Application d'analyse de santé des tables ServiceNow
- 4 widgets : Dashboard, Analysis Detail, Documentation
- Workflow : Sélectionner config → Run Analysis → Voir résultats

TÂCHE :
Fais-moi une analyse UX détaillée :
1. **Parcours utilisateur actuel** (user journey)
2. **Pain points** (problèmes/frustrations possibles)
3. **Friction points** (où l'utilisateur peut être bloqué)
4. **Opportunités d'amélioration**
5. **Quick wins** (améliorations rapides)
6. **Long-term improvements** (améliorations long terme)

MÉTHODOLOGIE :
- Utilise les heuristiques de Nielsen
- Pense comme un admin ServiceNow novice
- Pense comme un admin ServiceNow expert

FORMAT :
Tableau avec :
- Fonctionnalité
- Problème actuel
- Impact (High/Medium/Low)
- Effort (High/Medium/Low)
- Proposition d'amélioration
- Priorité

Retourne l'analyse complète.
```

---

### Prompt 3.2 : Améliorer le Widget Dashboard

```
Je veux améliorer le widget Dashboard de mon application FHA.

CONTEXTE ACTUEL :
- Dropdown pour sélectionner une configuration
- Bouton "Run Analysis"
- Liste des analyses récentes

PROBLÈMES IDENTIFIÉS (colle ici les résultats du Prompt 3.1)

TÂCHE :
Propose-moi des améliorations concrètes avec code :

1. **Quick Actions**
   - Boutons rapides pour analyses fréquentes
   - "Analyze All" pour lancer toutes les configs

2. **Statistiques en Temps Réel**
   - Nombre total d'analyses
   - Score moyen
   - Top 5 des tables problématiques

3. **Recherche & Filtres**
   - Recherche par table name
   - Filtre par date
   - Filtre par health score

4. **Visualisations**
   - Graphique d'évolution du health score
   - Répartition des issues par sévérité

5. **Actions Batch**
   - Sélection multiple de configs
   - Analyse en batch
   - Export multiple

Pour chaque amélioration :
- Mockup HTML
- Code AngularJS (client controller)
- Code Server Script
- CSS

Retourne le code complet pour 2-3 améliorations prioritaires.
```

---

### Prompt 3.3 : Améliorer le Widget Analysis Detail

```
Je veux améliorer le widget Analysis Detail.

CONTEXTE ACTUEL :
- Tabs : Overview, Issues, JSON
- Filtres : severity, type
- Search bar
- Table d'issues

TÂCHE :
Améliore ce widget avec :

1. **Vue Overview Améliorée**
   - Health score avec jauge visuelle (gauge chart)
   - Répartition issues par sévérité (pie chart)
   - Top 5 issues critiques
   - Recommandations automatiques

2. **Vue Issues Améliorée**
   - Groupement par catégorie (collapsible)
   - Tri avancé (multi-colonnes)
   - Filtres combinés (severity + type + search)
   - Marquage issues comme "resolved" ou "ignored"
   - Export sélectif (seulement issues sélectionnées)

3. **Vue Détails d'une Issue**
   - Modal ou panel latéral
   - Informations complètes
   - Lien direct vers l'enregistrement ServiceNow
   - Actions recommandées
   - Bouton "Create Story" pour créer une Story SCRUM

4. **Vue Timeline**
   - Nouvelle tab "Timeline"
   - Historique des analyses pour cette table
   - Graphique d'évolution du score

5. **Vue Comparaison**
   - Nouvelle tab "Compare"
   - Comparer avec analyse précédente
   - Highlight des nouvelles issues / issues résolues

Fournis le code pour 2-3 améliorations avec :
- HTML
- AngularJS controller
- Server script
- CSS

Priorise les améliorations par impact/effort.
```

---

### Prompt 3.4 : Système de Notifications

```
Je veux ajouter un système de notifications à mon application FHA.

TÂCHE :
Crée-moi un système de notifications qui :

1. **Notifications In-App**
   - Bell icon avec badge de count
   - Dropdown des notifications
   - Types : success, info, warning, error
   - Marquage comme "lu"
   - Suppression

2. **Notifications Email**
   - Email quand analyse terminée
   - Email si health score < 40 (critique)
   - Email résumé hebdomadaire
   - Template email responsive

3. **Notifications ServiceNow**
   - Créer enregistrement dans sys_email
   - Utiliser GlideEmailOutbound
   - Log des notifications envoyées

4. **Préférences Utilisateur**
   - Table de préférences (user_preferences)
   - UI pour gérer les notifications
   - Opt-in/opt-out par type

CODE NÉCESSAIRE :
1. Widget "FHA Notifications" (bell icon + dropdown)
2. Script Include "FHNotificationManager"
3. Email Notification (sys_email_template)
4. Table user_preferences
5. Scheduled Job pour envoi résumé hebdomadaire

Retourne le code complet pour chaque composant.
```

---

### Prompt 3.5 : Export Avancé (Excel, PDF)

```
Je veux améliorer l'export des résultats d'analyse.

CONTEXTE ACTUEL :
- Export JSON uniquement

TÂCHE :
Crée-moi un système d'export avancé :

1. **Export Excel**
   - Feuille "Summary" avec health score, charts
   - Feuille "Issues" avec toutes les issues
   - Feuille "Recommendations"
   - Formatage professionnel (couleurs, borders)
   - Utiliser Apache POI ou similaire

2. **Export PDF**
   - Page de couverture avec logo, date, table name
   - Section "Executive Summary"
   - Section "Issues by Severity"
   - Section "Detailed Issues"
   - Section "Recommendations"
   - Charts et graphiques
   - Utiliser iText ou similaire

3. **Export Email**
   - Envoyer résultat par email
   - Pièce jointe PDF ou Excel
   - Corps de l'email avec résumé

4. **Export Scheduled**
   - Scheduled Job qui exporte automatiquement
   - Stockage dans sys_attachment
   - Notification email

CODE :
- Script Include "FHExportManager"
- UI Action "Export to Excel"
- UI Action "Export to PDF"
- Scheduled Job "Weekly Report"

Retourne le code complet.
```

---

### Prompt 3.6 : Système de Recommandations Intelligentes

```
Je veux ajouter un système de recommandations intelligentes basé sur les issues détectées.

TÂCHE :
Crée-moi un système qui :

1. **Analyse les Issues**
   - Groupe les issues par pattern
   - Identifie les problèmes récurrents
   - Calculate l'impact (criticité × fréquence)

2. **Génère des Recommandations**
   - Pour chaque issue, propose une action
   - Priorise par impact et effort
   - Estime le temps de correction

3. **Actions Automatiques**
   - Créer Story dans SCRUM
   - Créer Task dans ITSM
   - Assigner à une équipe
   - Ajouter au backlog

4. **Knowledge Base**
   - Table de patterns connus
   - Solutions recommandées
   - Liens vers documentation ServiceNow

CODE :
- Script Include "FHRecommendationEngine"
- Table "fha_recommendations"
- Table "fha_knowledge_base"
- Widget "FHA Recommendations"

Exemples de recommandations :
- Si "UNUSED_FIELD" × 10 → "Consider field cleanup sprint"
- Si "BR_TOO_MANY" → "Consolidate business rules"
- Si "HARDCODED_SYSID" → "Replace with GlideRecord queries"

Retourne le code complet avec exemples.
```

---

## 🚀 PHASE 4 : FONCTIONNALITÉS AVANCÉES

### Prompt 4.1 : Dashboard Analytique avec Charts

```
Je veux créer un dashboard analytique pour mon application FHA.

TÂCHE :
Crée-moi un nouveau widget "FHA Analytics Dashboard" avec :

1. **KPIs (Indicateurs Clés)**
   - Total analyses effectuées
   - Score moyen de santé
   - Nombre total d'issues
   - Nombre de tables analysées
   - Tendance (↑↓)

2. **Graphiques**
   - Line chart : Évolution du health score dans le temps
   - Bar chart : Issues par sévérité
   - Pie chart : Répartition issues par catégorie
   - Heatmap : Health score par table
   - Timeline : Analyses récentes

3. **Filtres**
   - Date range picker
   - Filtre par table
   - Filtre par configuration
   - Groupement (daily, weekly, monthly)

4. **Widgets Interactifs**
   - Click sur chart → drill-down
   - Hover sur datapoint → tooltip détaillé
   - Export chart en image

TECHNOLOGIES :
- Chart.js ou D3.js
- AngularJS
- Bootstrap

CODE COMPLET :
- Widget HTML template
- AngularJS controller
- Server script pour data aggregation
- CSS

Retourne le code complet.
```

---

### Prompt 4.2 : Analyses Planifiées (Scheduled Analyses)

```
Je veux permettre aux utilisateurs de planifier des analyses automatiques.

TÂCHE :
Crée-moi un système de scheduled analyses :

1. **UI de Planification**
   - Widget "Schedule Analysis"
   - Champs : configuration, fréquence (daily/weekly/monthly), heure, destinataires email
   - Liste des analyses planifiées (active/inactive)
   - Actions : Edit, Delete, Enable/Disable

2. **Scheduled Job**
   - Script qui s'exécute toutes les heures
   - Vérifie les analyses à lancer
   - Lance l'analyse via FHAnalyzer
   - Envoie résultats par email

3. **Table de Configuration**
   - Table "fha_scheduled_analyses"
   - Champs : configuration, frequency, time, active, recipients, next_run, last_run

4. **Notifications**
   - Email quand analyse terminée
   - Email si erreur
   - Résumé dans email

CODE :
- Widget "FHA Schedule"
- Table "fha_scheduled_analyses"
- Scheduled Job "FHA Scheduled Runner"
- Script Include "FHScheduleManager"

Retourne le code complet.
```

---

### Prompt 4.3 : Comparaison d'Analyses (Before/After)

```
Je veux permettre de comparer deux analyses pour voir l'évolution.

TÂCHE :
Crée-moi une feature de comparaison :

1. **UI de Sélection**
   - Dropdown pour sélectionner 2 analyses
   - Filtres par table et date
   - Bouton "Compare"

2. **Vue Comparaison**
   - Split view (side-by-side)
   - Highlight des différences
   - Sections :
     * Health Score (before → after avec flèche ↑↓)
     * New Issues (rouges)
     * Resolved Issues (vertes)
     * Unchanged Issues (grises)
   - Métriques :
     * Δ Health Score
     * Δ Issues count
     * % d'amélioration

3. **Export Comparison**
   - Export PDF de la comparaison
   - Template professionnel

4. **Timeline de Comparaisons**
   - Graphique montrant l'évolution sur N analyses
   - Annotations sur les événements importants

CODE :
- Widget "FHA Comparison"
- Server script pour diff algorithm
- PDF export template

Retourne le code complet avec algorithme de diff.
```

---

### Prompt 4.4 : Machine Learning - Prédictions

```
Je veux ajouter des capacités de Machine Learning à mon application FHA pour prédire des problèmes.

TÂCHE :
Crée-moi un système de ML qui :

1. **Collecte des Données**
   - Historique des analyses
   - Patterns d'issues
   - Corrélations entre issues

2. **Modèles de Prédiction**
   - Prédire le prochain health score
   - Prédire les issues futures
   - Identifier les tables à risque
   - Suggérer les vérifications prioritaires

3. **Anomaly Detection**
   - Détecter les changements anormaux
   - Alerter si dégradation rapide
   - Identifier les outliers

4. **UI de Prédictions**
   - Widget "FHA Predictions"
   - Graphiques de tendances
   - Score de confiance
   - Actions recommandées

APPROCHE :
- Simple : Regression linéaire, moving averages
- Avancé : TensorFlow.js dans le browser ou Python backend

CODE :
Fournis :
1. Script de collecte de données (training set)
2. Algorithme de prédiction (JavaScript ou Python)
3. Widget pour afficher les prédictions
4. REST API pour accéder aux prédictions

Commence par l'approche simple avec JavaScript.
```

---

### Prompt 4.5 : Intégration avec ServiceNow ITSM

```
Je veux intégrer mon application FHA avec ServiceNow ITSM.

TÂCHE :
Crée-moi des intégrations qui :

1. **Créer Stories/Tasks Automatiquement**
   - Depuis une issue FHA → Créer Story dans table "rm_story"
   - Pré-remplir : Short description, Description, Acceptance criteria
   - Lier la Story à l'issue FHA

2. **Créer Incidents**
   - Si health score < 30 → Créer incident automatique
   - Assigner à l'équipe responsable
   - Priorité basée sur criticité

3. **Dashboard ITSM**
   - Widget dans ITSM montrant FHA stats
   - Intégrer dans homepage ITSM

4. **Workflows ITSM**
   - Workflow de résolution d'issues FHA
   - États : New, In Progress, Resolved, Closed
   - Notifications automatiques

CODE :
- Script Include "FHAITSMIntegration"
- UI Actions "Create Story" et "Create Incident"
- Workflow "FHA Issue Resolution"
- Widget "FHA ITSM Dashboard"

Retourne le code complet.
```

---

### Prompt 4.6 : API REST Étendue

```
Je veux étendre mon API REST pour permettre plus d'intégrations.

CONTEXTE ACTUEL :
- 8 endpoints existants (GET /tables, POST /analyze, etc.)

TÂCHE :
Crée-moi de nouveaux endpoints :

1. **POST /batch-analyze**
   - Lancer plusieurs analyses en parallèle
   - Retourner job_id pour tracking
   - Endpoint GET /batch-status/:job_id

2. **GET /trends**
   - Retourner tendances historiques
   - Query params : table_name, period, metric

3. **POST /webhook**
   - Configurer webhook pour notifications
   - Envoyer POST à URL externe quand analyse terminée

4. **GET /recommendations**
   - Retourner recommandations pour une table
   - Basé sur analyses passées

5. **POST /fix-issue**
   - Appliquer un fix automatique à une issue
   - Exemple : Supprimer un champ inutilisé

6. **GET /health**
   - Sanity check de l'API
   - Status de tous les composants

CODE :
Pour chaque endpoint :
- REST API Operation (XML)
- Script
- Exemples d'appels curl
- Documentation Swagger/OpenAPI

Retourne le code complet.
```

---

### Prompt 4.7 : Système de Plugins

```
Je veux rendre mon application FHA extensible via un système de plugins.

TÂCHE :
Crée-moi une architecture de plugins qui permet :

1. **Structure de Plugin**
   - Table "fha_plugins"
   - Champs : name, description, script, active, version, author
   - Chaque plugin = Script Include

2. **Types de Plugins**
   - Custom Handlers (nouveaux handlers de règles)
   - Custom Verification Items (nouvelles vérifications)
   - Custom Exporters (nouveaux formats d'export)
   - Custom Notifications (nouveaux canaux)
   - Custom Visualizations (nouveaux charts)

3. **Plugin Manager**
   - UI pour installer/désinstaller plugins
   - Enable/Disable plugins
   - Configuration des plugins
   - Update plugins

4. **Plugin Store**
   - Repository de plugins
   - Rating et reviews
   - Documentation par plugin
   - Installation en 1 clic

5. **API pour Développeurs**
   - FHPlugin base class
   - Méthodes à override
   - Hooks (onAnalysisStart, onAnalysisComplete, etc.)
   - Documentation pour créer un plugin

EXEMPLE DE PLUGIN :
```javascript
var MyCustomPlugin = Class.create();
MyCustomPlugin.prototype = Object.extendsObject(FHPlugin, {
    initialize: function() {
        this.name = "My Custom Plugin";
        this.version = "1.0.0";
    },
    
    onAnalysisComplete: function(result) {
        // Custom logic
    },
    
    type: 'MyCustomPlugin'
});
```

Retourne :
1. Architecture complète
2. Base class FHPlugin
3. Plugin Manager code
4. 2-3 exemples de plugins
```

---

## 📋 CHECKLIST D'EXÉCUTION

### Phase 1 : Nettoyage (2-3 jours)
- [ ] Prompt 1.1 : Identifier composants obsolètes
- [ ] Prompt 1.2 : Générer script de suppression
- [ ] Exécuter script de suppression
- [ ] Prompt 1.3 : Nettoyer author_elective_update
- [ ] Prompt 1.4 : Créer Update Set de cleanup
- [ ] Tester l'application complète
- [ ] Commit Git

### Phase 2 : CSS & Thème (3-5 jours)
- [ ] Prompt 2.1 : Audit CSS actuel
- [ ] Prompt 2.2 : Créer Design System
- [ ] Prompt 2.3 : CSS Dashboard
- [ ] Prompt 2.4 : CSS Analysis Detail
- [ ] Prompt 2.5 : CSS Documentation
- [ ] Prompt 2.6 : Mode sombre (optionnel)
- [ ] Tester sur tous les navigateurs
- [ ] Commit Git

### Phase 3 : Fonctionnalités (1-2 semaines)
- [ ] Prompt 3.1 : Analyse UX
- [ ] Prompt 3.2 : Améliorer Dashboard
- [ ] Prompt 3.3 : Améliorer Analysis Detail
- [ ] Prompt 3.4 : Système de notifications
- [ ] Prompt 3.5 : Export avancé
- [ ] Prompt 3.6 : Recommandations intelligentes
- [ ] Tester chaque feature
- [ ] Commit Git

### Phase 4 : Avancé (2-3 semaines)
- [ ] Prompt 4.1 : Dashboard analytique
- [ ] Prompt 4.2 : Analyses planifiées
- [ ] Prompt 4.3 : Comparaison d'analyses
- [ ] Prompt 4.4 : ML Prédictions (optionnel)
- [ ] Prompt 4.5 : Intégration ITSM
- [ ] Prompt 4.6 : API REST étendue
- [ ] Prompt 4.7 : Système de plugins (optionnel)
- [ ] Tests complets
- [ ] Commit Git

---

## 💡 CONSEILS D'UTILISATION

### 1. Ordre d'Exécution
- ✅ **Suivre l'ordre des prompts** (1.1 → 1.2 → 1.3 → ...)
- ✅ **Valider chaque étape** avant de passer à la suivante
- ✅ **Tester fréquemment** (après chaque 2-3 prompts)

### 2. Adaptation des Prompts
- ✅ **Ajuster selon vos besoins** (supprimer/ajouter des features)
- ✅ **Ajouter votre contexte** (noms de tables, champs spécifiques)
- ✅ **Préciser les contraintes** (compatibilité, performance)

### 3. Validation du Code
- ✅ **Reviewer le code généré** avant de l'appliquer
- ✅ **Tester sur instance de dev** avant prod
- ✅ **Créer backups** avant modifications importantes

### 4. Itération
- ✅ **Affiner les prompts** si résultat non satisfaisant
- ✅ **Demander alternatives** ("Propose 3 autres approches")
- ✅ **Demander explications** ("Explique cette partie du code")

---

## 🎯 PROMPTS DE SUIVI

Si le code généré ne fonctionne pas ou nécessite des ajustements :

### Prompt de Debug
```
Le code que tu m'as fourni pour [FEATURE] ne fonctionne pas.

ERREUR :
[Coller l'erreur ou décrire le problème]

CODE ACTUEL :
[Coller le code]

COMPORTEMENT ATTENDU :
[Décrire ce qui devrait se passer]

COMPORTEMENT RÉEL :
[Décrire ce qui se passe réellement]

Aide-moi à debugger et fournis la version corrigée.
```

### Prompt d'Optimisation
```
Le code que tu m'as fourni pour [FEATURE] fonctionne mais est trop lent.

PROBLÈME DE PERFORMANCE :
[Décrire le problème]

CODE ACTUEL :
[Coller le code]

CONTRAINTES :
- Performance cible : [X secondes]
- Volume de données : [X records]

Propose une version optimisée avec explications.
```

### Prompt de Refactoring
```
Le code que tu m'as fourni pour [FEATURE] fonctionne mais n'est pas maintenable.

CODE ACTUEL :
[Coller le code]

PROBLÈMES :
- [Liste des problèmes : duplication, complexité, etc.]

Refactorise ce code en suivant les best practices ServiceNow et fournis :
1. Code refactorisé
2. Explications des changements
3. Tests unitaires (optionnel)
```

---

## 📊 ESTIMATION DE TEMPS (AVEC IA)

| Phase | Sans IA | Avec IA | Gain |
|-------|---------|---------|------|
| **Phase 1 : Nettoyage** | 1-2 sem | 2-3 jours | 70% |
| **Phase 2 : CSS/Thème** | 2-3 sem | 3-5 jours | 75% |
| **Phase 3 : Fonctionnalités** | 3-4 sem | 1-2 sem | 60% |
| **Phase 4 : Avancé** | 4-6 sem | 2-3 sem | 65% |
| **TOTAL** | **10-15 sem** | **4-6 sem** | **65%** |

**Accélération totale : ~2-3 mois → ~1 mois** 🚀

---

## ✅ PRÊT À COMMENCER ?

1. **Commencez par Phase 1, Prompt 1.1**
2. **Copiez le prompt**
3. **Collez dans votre IA**
4. **Ajoutez le contexte nécessaire**
5. **Exécutez et validez**
6. **Passez au suivant**

**Bonne chance ! 🚀**

---

**Créé par** : Claude (Expert ServiceNow)  
**Date** : 17 janvier 2026  
**Version** : 1.0  
**Pour** : Wilfried Waret - Accélération développement FHA
