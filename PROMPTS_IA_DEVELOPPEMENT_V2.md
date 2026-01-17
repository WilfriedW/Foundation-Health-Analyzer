# 🤖 Prompts IA Actionnables pour FHA
**Foundation Health Analyzer - Prompts Optimisés pour Actions Directes**

> **💡 IMPORTANT** : Ces prompts sont conçus pour que l'IA **FASSE LES ACTIONS** directement.  
> Utilisez **Claude** (claude.ai) ou **Cursor AI** (cursor.sh) qui peuvent lire/écrire des fichiers.  
> **Vous n'avez qu'à valider et commit** - l'IA fait le travail !

---

## 📋 Workflow

```
1. Copiez un prompt
   ↓
2. Collez dans Claude/Cursor
   ↓
3. L'IA lit et modifie les fichiers directement
   ↓
4. Vous validez (git diff)
   ↓
5. Vous committez
   ↓
6. Vous testez dans ServiceNow
   ↓
7. Prompt suivant
```

**Chemin du projet** : `/Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/`

---

## 🎯 PHASE 1 : NETTOYAGE DU CODE (2-3 jours)

### Prompt 1.1 : Identifier et Analyser les Composants Obsolètes

```
Tu es un expert ServiceNow. Je développe l'application Foundation Health Analyzer.

PROJET :
Chemin : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/
Update folder : d852994c8312321083e1b4a6feaad3e6/update/

CONTEXTE :
J'ai identifié 9 Script Includes inactifs à supprimer :
1. FHCheckTable
2. FHCheckAutomation
3. FHCheckIntegration
4. FHCheckSecurity
5. FHCheckRegistry
6. FHAnalysisContext
7. FHOptionsHandler
8. FHScanUtils
9. FHAUtils

TÂCHE - FAIS CES ACTIONS :

1. **LISTE** tous les fichiers XML dans d852994c8312321083e1b4a6feaad3e6/update/ qui contiennent "sys_script_include"

2. **POUR CHAQUE** des 9 Script Includes :
   - Trouve son fichier XML
   - Vérifie si <active>false</active>
   - Note le sys_id et nom du fichier

3. **CHERCHE** les références à ces classes dans TOUS les autres Script Includes actifs :
   - Utilise grep pour chercher "FHCheckTable", "FHCheckAutomation", etc.
   - Liste les fichiers qui les référencent

4. **CRÉE** le fichier docs/cleanup/CLEANUP_REPORT_PHASE1.md avec :
   - Liste des 9 Script Includes avec leur statut
   - Fichiers XML correspondants
   - Références trouvées (ou "Aucune référence" si 0)
   - Recommandation : Safe to delete / Needs review

5. **CRÉE** aussi docs/cleanup/FILES_TO_DELETE.txt avec la liste des fichiers à supprimer

**NE ME RETOURNE PAS UN SCRIPT - FAIS LES ACTIONS ET CRÉE LES FICHIERS !**

Dis-moi quand c'est terminé et montre-moi un résumé.
```

---

### Prompt 1.2 : Supprimer les Composants Obsolètes

```
Tu es un expert ServiceNow.

PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

CONTEXTE :
Le fichier docs/cleanup/CLEANUP_REPORT_PHASE1.md contient l'analyse.
Le fichier docs/cleanup/FILES_TO_DELETE.txt liste les fichiers à supprimer.

TÂCHE - FAIS CES ACTIONS :

1. **LIS** docs/cleanup/FILES_TO_DELETE.txt

2. **CRÉE** le dossier archive/cleanup-2026-01-17/ si besoin

3. **POUR CHAQUE** fichier à supprimer :
   - **COPIE** le fichier vers archive/cleanup-2026-01-17/ (backup)
   - **SUPPRIME** le fichier original
   - **LOG** l'action dans docs/cleanup/CLEANUP_ACTIONS.log

4. **CRÉE** docs/cleanup/CLEANUP_SUMMARY.md avec :
   - Nombre de fichiers supprimés
   - Taille totale libérée
   - Liste des fichiers supprimés
   - Emplacement du backup

5. **CRÉE** aussi scripts/cleanup_verification.js (script Background ServiceNow) qui :
   - Vérifie que les 9 Script Includes n'existent plus
   - Liste les Script Includes actifs restants
   - Génère un rapport JSON

**FAIS LES SUPPRESSIONS - Ne me retourne pas juste un plan !**

Dis-moi combien de fichiers ont été supprimés et où est le backup.
```

---

### Prompt 1.3 : Nettoyer author_elective_update

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

CONTEXTE :
Le dossier d852994c8312321083e1b4a6feaad3e6/author_elective_update/ contient ~143 fichiers XML de développement non utilisés en prod.

TÂCHE - FAIS CES ACTIONS :

1. **VÉRIFIE** que le dossier author_elective_update/ existe

2. **CRÉE** archive/author_elective_2026-01-17/

3. **DÉPLACE** tout le dossier author_elective_update/ vers l'archive
   (Utilise le système de fichiers pour move, pas juste copy)

4. **CRÉE** archive/author_elective_2026-01-17/README.txt expliquant :
   - Ce qui a été archivé
   - Pourquoi (composants de dev non utilisés)
   - Date
   - Comment restaurer si nécessaire

5. **CRÉE** docs/cleanup/ARCHIVE_SUMMARY.md avec :
   - Nombre de fichiers archivés
   - Taille libérée
   - Emplacement de l'archive

**FAIS LE DÉPLACEMENT - Ne me retourne pas un script bash !**
```

---

### Prompt 1.4 : Générer Documentation Update Set

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

CONTEXTE :
Phase 1 terminée. Fichiers supprimés et archivés.

TÂCHE - CRÉE CES FICHIERS :

1. **docs/cleanup/UPDATE_SET_GUIDE.md** :
   - Comment créer l'Update Set dans ServiceNow
   - Ce qu'il doit contenir (suppressions)
   - Comment le tester
   - Comment rollback si besoin

2. **docs/cleanup/TESTING_CHECKLIST.md** :
   - [ ] Tester Dashboard widget
   - [ ] Tester Analysis Detail widget
   - [ ] Tester toutes les APIs REST
   - [ ] Lancer une analyse complète
   - [ ] Vérifier aucune erreur JavaScript
   - [ ] Vérifier logs ServiceNow

3. **docs/cleanup/ROLLBACK_PLAN.md** :
   - Comment restaurer depuis archive/ si problème
   - Script pour ré-importer les fichiers
   - Qui contacter en cas de problème

**CRÉE CES 3 FICHIERS DE DOCUMENTATION !**
```

---

## 🎨 PHASE 2 : CSS & THÈME (3-5 jours)

### Prompt 2.1 : Extraire et Auditer le CSS Actuel

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

WIDGETS À AUDITER :
1. fha_dashboard : d852994c8312321083e1b4a6feaad3e6/update/sp_widget_223611488392321083e1b4a6feaad3db.xml
2. fha_analysis_detail : d852994c8312321083e1b4a6feaad3e6/update/sp_widget_3ee88bd48312f21083e1b4a6feaad39a.xml
3. fha-documentation : d852994c8312321083e1b4a6feaad3e6/update/sp_widget_5ada939c8392f21083e1b4a6feaad360.xml

TÂCHE - FAIS CES ACTIONS :

1. **POUR CHAQUE** widget :
   - **LIS** le fichier XML
   - **EXTRAIT** la section <css>...</css>
   - **SAUVEGARDE** dans docs/css-audit/[widget_name]_current.css

2. **ANALYSE** tous les CSS extraits et **CRÉE** docs/css-audit/CSS_AUDIT_REPORT.md avec :
   - Palette de couleurs actuelle (tous les hex codes trouvés)
   - Tailles de police (tous les font-size)
   - Espacements (margins/paddings récurrents)
   - Classes Bootstrap utilisées
   - Classes custom
   - Problèmes détectés (inline styles, !important, etc.)
   - Incohérences entre widgets

3. **CRÉE** docs/css-audit/RECOMMENDATIONS.md :
   - Couleurs à standardiser
   - Espacements à unifier
   - Variables CSS à créer
   - Priorité des changements

**EXTRAIS ET ANALYSE - Ne me donne pas juste une checklist !**
```

---

### Prompt 2.2 : Créer le Design System

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

CONTEXTE :
Le rapport docs/css-audit/CSS_AUDIT_REPORT.md contient l'audit.

TÂCHE - CRÉE UN DESIGN SYSTEM COMPLET :

1. **CRÉE** docs/design-system/README.md :
   - Vue d'ensemble du Design System
   - Comment l'utiliser
   - Comment l'appliquer aux widgets

2. **CRÉE** docs/design-system/colors.css :
   ```css
   :root {
     /* Primary Colors */
     --fha-primary: #0c63d4;
     --fha-primary-dark: #0a4fa8;
     --fha-primary-light: #3d7ee0;
     
     /* Severity Colors */
     --fha-severity-high: #dc2626;
     --fha-severity-medium: #f59e0b;
     --fha-severity-low: #10b981;
     
     /* Status Colors */
     /* Neutral Colors */
     /* Gradients */
   }
   ```

3. **CRÉE** docs/design-system/typography.css :
   - Font families
   - Font sizes (h1-h6, body, small)
   - Line heights
   - Letter spacing

4. **CRÉE** docs/design-system/spacing.css :
   - Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
   - Margin utilities
   - Padding utilities

5. **CRÉE** docs/design-system/components.css :
   - Buttons (.fha-btn-primary, .fha-btn-secondary, etc.)
   - Cards (.fha-card)
   - Badges (.fha-badge-high, .fha-badge-medium, .fha-badge-low)
   - Tables (.fha-table)
   - Forms (.fha-input, .fha-select)

6. **CRÉE** docs/design-system/animations.css :
   - Transitions
   - Hover effects
   - Loading states

7. **CRÉE** docs/design-system/examples.html :
   - Exemples visuels de tous les composants
   - Copy-paste ready HTML

INSPIRATION :
- Tailwind CSS (utility classes)
- Material Design 3 (modern)
- GitHub Dark Theme (professional)
- Notion (clean)

**CRÉE CES 7 FICHIERS - Design System complet et utilisable !**
```

---

### Prompt 2.3 : Appliquer Design System au Dashboard

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

FICHIER À MODIFIER :
d852994c8312321083e1b4a6feaad3e6/update/sp_widget_223611488392321083e1b4a6feaad3db.xml

DESIGN SYSTEM :
docs/design-system/

TÂCHE - MODIFIE LE WIDGET :

1. **LIS** le fichier XML du widget Dashboard

2. **LIS** tous les fichiers du Design System (colors.css, components.css, etc.)

3. **EXTRAIT** la section <css> actuelle

4. **RÉÉCRIS** le CSS en utilisant :
   - Variables du Design System
   - Classes de components.css
   - Layout moderne (Flexbox/Grid)
   - Responsive design
   - Animations douces

5. **REMPLACE** la section <css> dans le XML

6. **CRÉE** docs/css-changes/DASHBOARD_CSS_CHANGELOG.md :
   - Avant/Après (lignes de code)
   - Nouvelles classes ajoutées
   - Variables utilisées
   - Améliorations visuelles

**MODIFIE LE FICHIER XML DIRECTEMENT !**

Dis-moi quand c'est fait et montre-moi un extrait du nouveau CSS.
```

---

### Prompt 2.4 : Appliquer Design System à Analysis Detail

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

FICHIER : d852994c8312321083e1b4a6feaad3e6/update/sp_widget_3ee88bd48312f21083e1b4a6feaad39a.xml

TÂCHE - MÊME PROCESSUS QUE 2.3 :

1. **LIS** le widget Analysis Detail XML
2. **RÉÉCRIS** le CSS avec le Design System
3. **REMPLACE** dans le XML
4. **CRÉE** docs/css-changes/ANALYSIS_DETAIL_CSS_CHANGELOG.md

FOCUS SPÉCIAL :
- Tabs modernes avec indicateur actif
- Badges de sévérité colorés (utiliser --fha-severity-*)
- Table responsive
- Filtres élégants

**MODIFIE LE FICHIER XML !**
```

---

### Prompt 2.5 : Appliquer Design System à Documentation

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

FICHIER : d852994c8312321083e1b4a6feaad3e6/update/sp_widget_5ada939c8392f21083e1b4a6feaad360.xml

TÂCHE - MÊME PROCESSUS :

1. **RÉÉCRIS** le CSS du widget Documentation
2. **MODIFIE** le XML
3. **CRÉE** docs/css-changes/DOCUMENTATION_CSS_CHANGELOG.md

FOCUS :
- Navigation sticky élégante
- Code blocks avec syntax highlighting
- Smooth scroll
- Tables responsive

**MODIFIE LE FICHIER XML !**
```

---

### Prompt 2.6 : Dark Mode (Optionnel)

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

TÂCHE - AJOUTE LE DARK MODE :

1. **CRÉE** docs/design-system/dark-mode.css :
   ```css
   [data-theme="dark"] {
     --fha-primary: #3d7ee0;
     /* ... toutes les couleurs adaptées */
   }
   ```

2. **CRÉE** docs/design-system/theme-toggle.js :
   - Toggle dark/light
   - localStorage pour la préférence
   - Respect de prefers-color-scheme

3. **POUR CHAQUE** widget XML :
   - **AJOUTE** le CSS dark mode dans <css>
   - **AJOUTE** le script toggle dans <client_script>

4. **CRÉE** docs/design-system/DARK_MODE_GUIDE.md

**IMPLÉMENTE LE DARK MODE dans tous les widgets !**
```

---

## ⚙️ PHASE 3 : FONCTIONNALITÉS (1-2 semaines)

### Prompt 3.1 : Créer Analyse UX

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

WIDGETS À ANALYSER :
- Dashboard : sp_widget_223611488392321083e1b4a6feaad3db.xml
- Analysis Detail : sp_widget_3ee88bd48312f21083e1b4a6feaad39a.xml

TÂCHE - ANALYSE UX COMPLÈTE :

1. **LIS** les 2 widgets XML (HTML + Client Script)

2. **CRÉE** docs/ux-improvements/USER_JOURNEY.md :
   - Parcours utilisateur actuel (step by step)
   - Screenshots/mockups si possible
   - Pain points identifiés

3. **CRÉE** docs/ux-improvements/UX_AUDIT.md - Tableau avec :
   | Feature | Problème | Impact | Effort | Amélioration Proposée | Priorité |
   | --- | --- | --- | --- | --- | --- |
   | Sélection config | Dropdown basique | Medium | Low | Searchable dropdown + recent configs | High |
   | ... | ... | ... | ... | ... | ... |

4. **CRÉE** docs/ux-improvements/QUICK_WINS.md :
   - Top 5 améliorations rapides (< 1 jour)
   - Impact élevé / Effort faible

5. **CRÉE** docs/ux-improvements/LONG_TERM.md :
   - Améliorations long terme (1-2 semaines)
   - High impact / High effort

**ANALYSE ET CRÉE CES 4 FICHIERS !**
```

---

### Prompt 3.2 : Améliorer Dashboard - Statistiques

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

FICHIER : d852994c8312321083e1b4a6feaad3e6/update/sp_widget_223611488392321083e1b4a6feaad3db.xml

FEATURE : Ajouter statistiques en temps réel au Dashboard

TÂCHE - MODIFIE LE WIDGET :

1. **LIS** le widget Dashboard XML

2. **DANS <template>** - AJOUTE après le dropdown :
   ```html
   <div class="fha-stats-container">
     <div class="fha-stat-card">
       <div class="stat-value">{{c.data.totalAnalyses}}</div>
       <div class="stat-label">Total Analyses</div>
     </div>
     <div class="fha-stat-card">
       <div class="stat-value">{{c.data.avgHealthScore}}</div>
       <div class="stat-label">Score Moyen</div>
     </div>
     <!-- ... 3 autres stats -->
   </div>
   ```

3. **DANS <client_script>** - AJOUTE fonction :
   ```javascript
   c.loadStats = function() {
     c.server.get({action: 'getStats'}).then(function(r) {
       c.data.totalAnalyses = r.data.total;
       c.data.avgHealthScore = r.data.avgScore;
       // ...
     });
   };
   c.loadStats(); // Appeler au chargement
   ```

4. **DANS <server_script>** - AJOUTE :
   ```javascript
   if (input.action === 'getStats') {
     data.total = getAnalysesCount();
     data.avgScore = getAvgHealthScore();
     // ...
   }
   
   function getAnalysesCount() {
     var gr = new GlideRecord('x_1310794_founda_0_results');
     gr.query();
     return gr.getRowCount();
   }
   // ... autres fonctions
   ```

5. **DANS <css>** - AJOUTE styles pour .fha-stats-container

6. **SAUVEGARDE** le XML modifié

7. **CRÉE** docs/features/DASHBOARD_STATS_ADDED.md documentant les changements

**MODIFIE LE WIDGET ET IMPLÉMENTE LA FEATURE !**
```

---

### Prompt 3.3 : Améliorer Analysis Detail - Charts

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

FICHIER : d852994c8312321083e1b4a6feaad3e6/update/sp_widget_3ee88bd48312f21083e1b4a6feaad39a.xml

FEATURE : Ajouter gauge chart pour health score et pie chart pour issues

TÂCHE :

1. **LIS** le widget Analysis Detail

2. **AJOUTE** Chart.js dans <link> :
   ```html
   <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
   ```

3. **DANS <template>** tab Overview - AJOUTE :
   ```html
   <div class="fha-charts-row">
     <div class="chart-container">
       <canvas id="healthScoreGauge"></canvas>
     </div>
     <div class="chart-container">
       <canvas id="issuesPieChart"></canvas>
     </div>
   </div>
   ```

4. **DANS <client_script>** - AJOUTE fonctions pour créer les charts

5. **MODIFIE** le XML et **SAUVEGARDE**

6. **CRÉE** docs/features/CHARTS_ADDED.md

**IMPLÉMENTE LES CHARTS DIRECTEMENT !**
```

---

### Prompt 3.4 : Système de Notifications

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

TÂCHE - CRÉE SYSTÈME COMPLET :

1. **CRÉE** nouveau widget : docs/new-widgets/fha_notifications.xml
   - Bell icon avec badge de count
   - Dropdown des notifications
   - HTML + AngularJS + Server Script complets

2. **CRÉE** Script Include : docs/new-scripts/FHNotificationManager.xml
   ```javascript
   var FHNotificationManager = Class.create();
   FHNotificationManager.prototype = {
     sendNotification: function(userId, type, message) {
       // Code complet ici
     },
     // ... autres méthodes
   };
   ```

3. **CRÉE** Table : docs/new-tables/x_1310794_founda_0_notifications.xml
   - Fields : user, type, message, read, created_on

4. **CRÉE** Email Template : docs/new-emails/analysis_complete_template.xml

5. **CRÉE** Scheduled Job : docs/new-jobs/weekly_summary_job.xml

6. **CRÉE** docs/features/NOTIFICATIONS_IMPLEMENTATION_GUIDE.md

**CRÉE TOUS CES FICHIERS XML PRÊTS À IMPORTER !**
```

---

### Prompt 3.5 : Export Excel/PDF

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

TÂCHE - IMPLÉMENTE EXPORTS :

1. **CRÉE** Script Include : docs/new-scripts/FHExportManager.xml
   ```javascript
   var FHExportManager = Class.create();
   FHExportManager.prototype = {
     exportToExcel: function(resultSysId) {
       // Utiliser Apache POI
       // Feuilles : Summary, Issues, Recommendations
     },
     
     exportToPDF: function(resultSysId) {
       // Utiliser iText
       // Page de couverture + sections
     },
     
     type: 'FHExportManager'
   };
   ```

2. **CRÉE** UI Actions : 
   - docs/new-ui-actions/export_to_excel.xml
   - docs/new-ui-actions/export_to_pdf.xml

3. **CRÉE** REST API endpoint : docs/new-rest-api/export_endpoint.xml

4. **CRÉE** docs/features/EXPORT_GUIDE.md

**CRÉE TOUS CES FICHIERS XML !**
```

---

### Prompt 3.6 : Recommandations Intelligentes

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

TÂCHE - SYSTÈME DE RECOMMANDATIONS :

1. **CRÉE** Script Include : docs/new-scripts/FHRecommendationEngine.xml
   ```javascript
   var FHRecommendationEngine = Class.create();
   FHRecommendationEngine.prototype = {
     analyzeIssues: function(issues) {
       // Groupe par pattern
       // Calculate impact
       return recommendations;
     },
     
     generateActions: function(issue) {
       // Retourne actions recommandées
     },
     
     type: 'FHRecommendationEngine'
   };
   ```

2. **CRÉE** Tables :
   - docs/new-tables/fha_recommendations.xml
   - docs/new-tables/fha_knowledge_base.xml

3. **CRÉE** Widget : docs/new-widgets/fha_recommendations.xml

4. **CRÉE** docs/features/RECOMMENDATIONS_GUIDE.md

**CRÉE TOUS CES FICHIERS !**
```

---

## 🚀 PHASE 4 : AVANCÉ (2-3 semaines)

### Prompt 4.1 : Dashboard Analytique

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

TÂCHE - DASHBOARD AVEC CHARTS :

1. **CRÉE** nouveau widget : docs/new-widgets/fha_analytics_dashboard.xml
   - KPIs en haut (4 cards)
   - Line chart : Évolution health score
   - Bar chart : Issues par sévérité
   - Pie chart : Répartition par catégorie
   - Heatmap : Health score par table
   - Filtres : date range, table, config

2. HTML template complet avec Chart.js

3. AngularJS controller avec fonctions :
   - loadKPIs()
   - loadTrendData()
   - createCharts()
   - applyFilters()

4. Server script pour aggregation de données

5. CSS pour layout grid moderne

6. **CRÉE** docs/features/ANALYTICS_DASHBOARD_GUIDE.md

**CRÉE LE WIDGET XML COMPLET !**
```

---

### Prompt 4.2 : Analyses Planifiées

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

TÂCHE - SCHEDULED ANALYSES :

1. **CRÉE** Table : docs/new-tables/fha_scheduled_analyses.xml
   - Fields : configuration, frequency, time, active, recipients, next_run, last_run

2. **CRÉE** Widget : docs/new-widgets/fha_schedule.xml
   - UI pour créer/modifier schedules
   - Liste des schedules actifs
   - Actions : Edit, Delete, Enable/Disable

3. **CRÉE** Scheduled Job : docs/new-jobs/fha_scheduled_runner.xml
   - S'exécute toutes les heures
   - Vérifie les analyses à lancer
   - Lance via FHAnalyzer
   - Envoie email

4. **CRÉE** Script Include : docs/new-scripts/FHScheduleManager.xml

5. **CRÉE** docs/features/SCHEDULED_ANALYSES_GUIDE.md

**CRÉE TOUS CES FICHIERS XML !**
```

---

### Prompt 4.3 : Comparaison Before/After

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

TÂCHE - COMPARISON FEATURE :

1. **CRÉE** Widget : docs/new-widgets/fha_comparison.xml
   - UI : 2 dropdowns pour sélectionner analyses
   - Split view (side-by-side)
   - Highlight différences (rouge/vert)
   - Métriques : Δ health score, Δ issues count
   - Export PDF de la comparaison

2. **CRÉE** Script Include : docs/new-scripts/FHComparisonEngine.xml
   ```javascript
   var FHComparisonEngine = Class.create();
   FHComparisonEngine.prototype = {
     compareAnalyses: function(id1, id2) {
       // Diff algorithm
       // Return {
       //   newIssues: [],
       //   resolvedIssues: [],
       //   unchangedIssues: []
       // }
     },
     
     type: 'FHComparisonEngine'
   };
   ```

3. **CRÉE** docs/features/COMPARISON_GUIDE.md

**CRÉE CES FICHIERS !**
```

---

### Prompt 4.4 : ML Prédictions (Simplifié)

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

TÂCHE - PRÉDICTIONS SIMPLES :

1. **CRÉE** Script Include : docs/new-scripts/FHPredictionEngine.xml
   ```javascript
   var FHPredictionEngine = Class.create();
   FHPredictionEngine.prototype = {
     predictNextScore: function(tableName) {
       // Récupère historique
       // Linear regression simple
       // Return predicted score + confidence
     },
     
     identifyRiskyTables: function() {
       // Tables avec health score en baisse
       // Return list ordered by risk
     },
     
     type: 'FHPredictionEngine'
   };
   ```

2. **CRÉE** Widget : docs/new-widgets/fha_predictions.xml
   - Affiche prédictions
   - Graphiques de tendances
   - Score de confiance
   - Actions recommandées

3. **CRÉE** docs/features/PREDICTIONS_GUIDE.md

**CRÉE CES FICHIERS - Algorithme simple JavaScript !**
```

---

### Prompt 4.5 : Intégration ITSM

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

TÂCHE - INTÉGRATION ITSM :

1. **CRÉE** Script Include : docs/new-scripts/FHAITSMIntegration.xml
   ```javascript
   var FHAITSMIntegration = Class.create();
   FHAITSMIntegration.prototype = {
     createStoryFromIssue: function(issue) {
       var story = new GlideRecord('rm_story');
       story.initialize();
       story.short_description = issue.code + ': ' + issue.message;
       story.description = this._buildDescription(issue);
       story.insert();
       return story.sys_id;
     },
     
     createIncidentIfCritical: function(analysisResult) {
       if (analysisResult.health_score < 30) {
         // Créer incident
       }
     },
     
     type: 'FHAITSMIntegration'
   };
   ```

2. **CRÉE** UI Actions :
   - docs/new-ui-actions/create_story_from_issue.xml
   - docs/new-ui-actions/create_incident.xml

3. **CRÉE** Workflow : docs/new-workflows/fha_issue_resolution.xml

4. **CRÉE** Widget ITSM : docs/new-widgets/fha_itsm_dashboard.xml

5. **CRÉE** docs/features/ITSM_INTEGRATION_GUIDE.md

**CRÉE TOUS CES FICHIERS !**
```

---

### Prompt 4.6 : API REST Étendue

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

TÂCHE - NOUVEAUX ENDPOINTS :

**CRÉE** ces fichiers dans docs/new-rest-api/ :

1. **batch_analyze.xml** - POST /batch-analyze
   - Lancer plusieurs analyses en parallèle
   - Retourner job_id
   
2. **batch_status.xml** - GET /batch-status/:job_id
   - Status du batch

3. **trends.xml** - GET /trends
   - Query params : table_name, period, metric

4. **webhook.xml** - POST /webhook
   - Configurer webhook pour notifications

5. **recommendations.xml** - GET /recommendations/:table_name

6. **health.xml** - GET /health
   - Sanity check de l'API

Pour chaque endpoint :
- XML complet avec script
- Exemples d'appels curl dans comments
- Gestion d'erreurs

**CRÉE CES 6 FICHIERS XML !**
```

---

### Prompt 4.7 : Système de Plugins

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

TÂCHE - ARCHITECTURE PLUGINS :

1. **CRÉE** Table : docs/new-tables/fha_plugins.xml
   - Fields : name, description, script, active, version, author, type

2. **CRÉE** Base Class : docs/new-scripts/FHPlugin.xml
   ```javascript
   var FHPlugin = Class.create();
   FHPlugin.prototype = {
     initialize: function() {
       this.name = '';
       this.version = '1.0.0';
     },
     
     onAnalysisStart: function(config) {
       // Hook - to override
     },
     
     onAnalysisComplete: function(result) {
       // Hook - to override
     },
     
     type: 'FHPlugin'
   };
   ```

3. **CRÉE** Plugin Manager : docs/new-scripts/FHPluginManager.xml
   - loadPlugins()
   - executeHook(hookName, data)

4. **CRÉE** Widget : docs/new-widgets/fha_plugin_manager.xml
   - UI pour gérer plugins
   - Install/Uninstall
   - Enable/Disable

5. **CRÉE** 3 exemples de plugins :
   - docs/example-plugins/SlackNotificationPlugin.xml
   - docs/example-plugins/CustomMetricsPlugin.xml
   - docs/example-plugins/AutoFixPlugin.xml

6. **CRÉE** docs/features/PLUGINS_DEVELOPER_GUIDE.md
   - Comment créer un plugin
   - API disponible
   - Exemples

**CRÉE TOUT LE SYSTÈME DE PLUGINS !**
```

---

## 📊 TRACKING

Créez ce fichier pour suivre votre progression :

```
PROJET : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/

**CRÉE** docs/PROGRESS_TRACKING.md :

# 📊 Progression FHA

## Phase 1 : Nettoyage
- [ ] 1.1 : Analyse composants obsolètes
- [ ] 1.2 : Suppression
- [ ] 1.3 : Archive author_elective
- [ ] 1.4 : Documentation Update Set

## Phase 2 : CSS
- [ ] 2.1 : Audit CSS
- [ ] 2.2 : Design System
- [ ] 2.3 : CSS Dashboard
- [ ] 2.4 : CSS Analysis Detail
- [ ] 2.5 : CSS Documentation
- [ ] 2.6 : Dark Mode

## Phase 3 : Fonctionnalités
- [ ] 3.1 : Analyse UX
- [ ] 3.2 : Dashboard Stats
- [ ] 3.3 : Charts
- [ ] 3.4 : Notifications
- [ ] 3.5 : Exports
- [ ] 3.6 : Recommandations

## Phase 4 : Avancé
- [ ] 4.1 : Analytics Dashboard
- [ ] 4.2 : Scheduled Analyses
- [ ] 4.3 : Comparison
- [ ] 4.4 : Prédictions
- [ ] 4.5 : ITSM Integration
- [ ] 4.6 : API REST étendue
- [ ] 4.7 : Plugins

---

Date de début : ___________
Date de fin estimée : ___________

**CRÉE CE FICHIER !**
```

---

## ✅ PRÊT À COMMENCER

**Commencez maintenant avec le Prompt 1.1 !**

Copiez-collez le dans Claude ou Cursor AI et laissez l'IA faire le travail.

**Bonne chance ! 🚀**

---

**Créé par** : Claude (Expert ServiceNow)  
**Date** : 17 janvier 2026  
**Version** : 2.0 - Prompts Actionnables  
**Pour** : Wilfried Waret
