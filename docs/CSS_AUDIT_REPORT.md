# CSS Audit Report - FHA Application

## Variables CSS du Thème (Source de Vérité)
- Primary: `#0378BE` (`--fha-primary`)
- Primary Dark: `#035B8E` (`--fha-primary-dark`)
- Primary Light: `#E3F2FD` (`--fha-primary-light`)
- Success: `#28A745` (`--fha-success`)
- Warning: `#FFC107` (`--fha-warning`)
- Danger: `#DC3545` (`--fha-danger`)
- Info: `#17A2B8` (`--fha-info`)
- Gray 100/200/500/800: `--fha-gray-100`, `--fha-gray-200`, `--fha-gray-500`, `--fha-gray-800`
- Header Gradient: `--fha-header-bg`
- Radius: `--fha-radius` (8px), `--fha-radius-lg` (10px)
- Shadow: `--fha-shadow`, `--fha-shadow-lg`
- Transition: `--fha-transition`

## Widget 1: FHA Homepage
Fichier: `d852994c8312321083e1b4a6feaad3e6/update/sp_widget_223611488392321083e1b4a6feaad3db.xml`

### ✅ Conforme
- Classes déjà alignées avec la nomenclature `fha-*` (pas de préfixes widget-specific visibles).
- Utilise déjà des classes standard (`.fha-card`, `.fha-btn-primary`, `.fha-section`, `.fha-stat-*`) mais valeurs non alignées.

### ❌ À corriger
- [ ] L357-L364: Gradient et shadow hardcodés sur `.fha-page-header` → `var(--fha-primary*)` + `var(--fha-shadow)`.
- [ ] L361-L363, L376-L387, L611-L616: `border-radius: 12px` / shadows custom → `var(--fha-radius-lg)` + `var(--fha-shadow*)`.
- [ ] L389-L399: `#f8f9fa`, `#e9ecef`, `#333` → `var(--fha-gray-100/200/800)`.
- [ ] L406-L419: `border`, `transition`, `box-shadow` custom sur `.fha-select` → `var(--fha-gray-200)` + `var(--fha-transition)` + standard focus.
- [ ] L422-L438: `.fha-btn-primary` gradient/transition/shadows hardcodés → standard bouton FHA.
- [ ] L445-L448: `.fha-loading` couleur hardcodée → `var(--fha-primary)`.
- [ ] L456-L477: badges de score avec couleurs hardcodées (`#28A745`, `#856404`, `#DC3545`) → variables `--fha-*`.
- [ ] L485-L507: `.fha-issue-item` fond/bordure/hover hardcodés → `var(--fha-gray-*)`.
- [ ] L509-L533: `.fha-issue-severity` + `.fha-severity-*` utilisent radius/couleurs hardcodées → `var(--fha-radius)` + `--fha-*`.
- [ ] L539-L547: `.fha-issue-code`/`.fha-issue-message` utilisent `#333`/`#666` → `--fha-gray-800/500`.
- [ ] L555-L567: `.fha-recent-table` fond/bordures/couleurs hardcodés → variables `--fha-gray-*`.
- [ ] L580-L592: `.fha-stat-box` gradient + radius 12px + texte couleur primaire hardcodée → variables.
- [ ] L600-L604: `.fha-no-issues` couleur hardcodée → `--fha-success`.
- [ ] L612-L632: `.fha-section` bordures/radius/gradients hardcodés → `--fha-gray-*` + `--fha-radius*`.
- [ ] L640-L650: `.fha-section-title` couleurs hardcodées → variables.
- [ ] L652-L659: `.fha-section-count` background `#6c757d` → `--fha-gray-500`.
- [ ] L678-L705: `.fha-header-link` et `.fha-header-link-green` gradients/shadows/radius hardcodés → classes standard de boutons FHA.
- [ ] L713-L726: `.fha-section-overview` + `.fha-overview-header` couleurs hardcodées → variables.
- [ ] L734-L783: `.fha-overview-table` couleurs/bordures hardcodées → variables.
- [ ] L793-L801: `.fha-status-badge` couleurs hardcodées → `--fha-success/--fha-gray-500`.
- [ ] L803-L810: `.fha-type-badge` couleurs hardcodées → `--fha-gray-*`.
- [ ] L819-L837: `.fha-fill-bar*` couleurs hardcodées → `--fha-success/--fha-warning/--fha-danger`.
- [ ] L846-L857: `.fha-mini-link` couleurs hardcodées → variables.
- [ ] L867-L890: `.fha-severity-badge*` couleurs hardcodées → variables.
- [ ] L897-L908: `.fha-view-all-link` couleurs hardcodées → variables.
- [ ] L916-L926: `.fha-option-enabled/disabled` palettes hardcodées → variables (success/gray).
- [ ] L937-L959: `.fha-issue-link*` gradients/radius/transition hardcodés → classes standard FHA.

## Widget 2: FHA Analysis Results
Fichier: `d852994c8312321083e1b4a6feaad3e6/update/sp_widget_9f5755c88392321083e1b4a6feaad3de.xml`

### ❌ À corriger
- [ ] L153-L160: Header gradient `#1a5a96/#2980b9` + radius 12px + shadow custom → utiliser `--fha-primary*`, `--fha-radius-lg`, `--fha-shadow`.
- [ ] L194-L205: `.fha-filter-bar` shadow/radius custom → `--fha-shadow` + `--fha-radius-lg`.
- [ ] L213-L218: label couleur `#495057` → `--fha-gray-800/500`.
- [ ] L220-L232: `.fha-filter-input` border/couleurs/transition hardcodés → variables + `--fha-transition`.
- [ ] L245-L276: `.fha-btn*` styles et couleurs hardcodés → classes standard FHA.
- [ ] L285-L297: `.fha-analysis-card` shadow/radius/hover custom → `--fha-shadow*` + `--fha-radius-lg`.
- [ ] L299-L311: `.fha-card-header` + titres couleurs hardcodées → variables.
- [ ] L342-L358: `.fha-score-circle.*` couleurs hardcodées → `--fha-success/--fha-warning/--fha-danger`.
- [ ] L360-L364: `.fha-score-label` couleur `#6c757d` → `--fha-gray-500`.
- [ ] L381-L389: `.fha-card-stat-value.*` couleurs hardcodées → `--fha-*`.
- [ ] L397-L405: `.fha-card-meta` couleur hardcodée → `--fha-gray-500`.
- [ ] L416-L433: `.fha-card-action` fond/couleurs hardcodés → variables.
- [ ] L436-L457: `.fha-empty-state` radius/shadow/couleurs hardcodés → variables.
- [ ] L472-L481: `.fha-loading i` couleur hardcodée → `--fha-primary`.
- [ ] L483-L529: `.fha-table*` background/bordures/couleurs hardcodés → variables.
- [ ] L532-L553: `.fha-table-score.*` couleurs hardcodées → `--fha-*`.
- [ ] L556-L578: `.fha-view-toggle*` fond/shadow/couleurs hardcodés → variables.

## Widget 3: FHA Header
Fichier: `d852994c8312321083e1b4a6feaad3e6/update/sp_widget_3ee88bd48312f21083e1b4a6feaad39a.xml`

### ❌ À corriger
- [ ] L280-L294: `.fha-header` gradient `#0c63d4/#0a4f9c` + radius 14px + shadow custom → `--fha-header-bg` + `--fha-radius-lg` + `--fha-shadow-lg`.
- [ ] L309-L324: `.fha-stat-card` couleurs/radius/shadows hardcodés → variables.
- [ ] L333-L343: `.fha-stat-value.*` couleurs hardcodées → `--fha-*`.
- [ ] L345-L349: `.fha-stat-label` couleurs hardcodées → `--fha-gray-500`.
- [ ] L371-L390: `.fha-btn` couleur/shadow/radius hardcodés → `.fha-btn-primary`.
- [ ] L392-L401: `.fha-badge` couleurs hardcodées → variables.
- [ ] L404-L434: `.fha-tab-btn` couleur/radius/hover hardcodés → variables + `--fha-transition`.
- [ ] L444-L451: `.fha-card` radius/shadow/border hardcodés → `.fha-card` standard.
- [ ] L460-L470: `.fha-card__head` background/border hardcodés → variables.
- [ ] L473-L494: `.fha-data-table*` couleurs/borders hardcodés → variables.
- [ ] L496-L512: Classes non préfixées `(.pill, .pill.*)` → doit devenir `fha-*`.
- [ ] L518-L529: Classes non préfixées `(.issue-badge, .sev-*)` → doit devenir `fha-*`.
- [ ] L531-L559: Classes non préfixées `(.section-title, .filter-bar)` → doit devenir `fha-*`.
- [ ] L571-L578: `.fha-link` couleur hardcodée → `--fha-primary`.
- [ ] L580-L588: Classes non préfixées `(.alert*)` + couleurs hardcodées → `fha-*` + variables.

## Widget 4: FHA Documentation
Fichier: `FHA_DOCUMENTATION_WIDGET_READY.xml`

### ❌ À corriger
- [ ] L99-L118: `:root` redéfinit des variables du thème avec une palette différente → supprimer et utiliser le thème global.
- [ ] L131-L137: `.fha-doc-header` gradient + shadow hardcodés → `--fha-header-bg` + `--fha-shadow`.
- [ ] L186-L219: `.fha-btn*` styles/shadows hardcodés → classes standard FHA.
- [ ] L223-L230: `.fha-doc-nav` shadow hardcodé → `--fha-shadow`.
- [ ] L263-L288: `.fha-doc-nav-btn.active` background `--fha-primary` OK, mais nomenclature `fha-doc-*` à uniformiser.
- [ ] L294-L308: `.fha-doc-section` radius 12px + shadow custom → `--fha-radius-lg` + `--fha-shadow`.
- [ ] L310-L320: `.fha-doc-section h2` border-bottom `--fha-primary-lighter` (non défini dans thème) → utiliser `--fha-primary-light`.
- [ ] L360-L389: `.fha-doc-table` shadow + borders hardcodés → variables.
- [ ] L431-L452: `.fha-code-block` background `--fha-gray-900` OK, mais text color `#e2e8f0` hardcodée → utiliser `--fha-gray-100` ou variable existante.
- [ ] L456-L477: `.fha-info-box.*` border-radius custom (0 8px 8px 0) OK mais couleurs doivent utiliser variables du thème.
- [ ] L491-L502: `.fha-card` hover shadow/transform hardcodés → `--fha-shadow-lg` + `--fha-transition`.
- [ ] L525-L544: `.fha-stat-card` radius 12px + shadow hardcodé → `--fha-radius` + `--fha-shadow`.
- [ ] L561-L600: Responsive OK mais nomenclature `fha-doc-*` à aligner (doit rester `fha-*` standard).

## Classes dupliquées / styles similaires (à standardiser)
- `.fha-card`: défini dans 3 widgets avec radius/shadow différents (Homepage, Results, Header, Documentation).
- `.fha-btn-primary` / `.fha-btn`: styles différents entre Homepage/Results/Header/Documentation.
- `.fha-stat-card` / `.fha-stat-*`: styles différents entre Homepage/Header/Documentation.
- `.fha-loading`: couleurs différentes entre Homepage/Results.
- `.fha-section` / `.fha-section-header`: styles différents entre Homepage/Results.
- `.fha-score-*` / `.fha-score-circle`: mêmes rôles mais couleurs hardcodées.

## Incohérences visuelles majeures
- Couleur primaire incohérente (`#1a5a96`, `#0c63d4`, `#0378BE`).
- Border-radius variables (8px, 10px, 12px, 14px).
- Shadows multiples (opacités/offsets variés).
- Transitions hétérogènes (`all 0.2s`, `box-shadow 0.2s`, `transform 0.2s ease`).
- Palette grise incohérente (`#333`, `#495057`, `#6c757d`, `#e9ecef`, `#f8f9fa`, `#eef5ff`, etc.).

## Résumé
- Total incohérences (couleurs hardcodées repérées) :
  - Homepage: 81 occurrences
  - Results: 51 occurrences
  - Header: 49 occurrences
  - Documentation: 18 occurrences (dont variables `:root` propres)
- Classes à uniformiser: `.fha-card`, `.fha-btn*`, `.fha-stat*`, `.fha-section*`, `.fha-score*`, `.fha-loading`
- Nomenclature à corriger: classes non préfixées (`.pill`, `.alert`, `.section-title`, `.filter-bar`, `.issue-badge`, `.sev-*`)
