# CSS Audit Report

## Sources analysees
- `d852994c8312321083e1b4a6feaad3e6/update/sp_widget_223611488392321083e1b4a6feaad3db.xml` -> `fha_dashboard` (CSS vide, theme FHA centralise)
- `d852994c8312321083e1b4a6feaad3e6/update/sp_widget_3ee88bd48312f21083e1b4a6feaad39a.xml` -> `fha_analysis_detail` (CSS vide, theme FHA centralise)
- `d852994c8312321083e1b4a6feaad3e6/author_elective_update/sp_widget_5ada939c8392f21083e1b4a6feaad360.xml` -> `fha-documentation` (CSS local complet)

## Palette de couleurs (hex)
- #0f172a
- #1a5a96
- #1e293b
- #1e40af
- #2563eb
- #2980b9
- #34d399
- #374151
- #4b5563
- #555555
- #666666
- #6b7280
- #93c5fd
- #9ca3af
- #d1fae5
- #d97706
- #dbeafe
- #dc2626
- #e0e0e0
- #e2e8f0
- #e5e7eb
- #e8f4fc
- #ecfdf5
- #ede9fe
- #eee
- #eff6ff
- #f1f5f9
- #f5f3ff
- #f5f7fa
- #f8fafc
- #f9fbfd
- #fee2e2
- #fef3c7
- #fffbeb
- #ffffff

## Couleurs non-hex
- rgba(26, 90, 150, 0.3)
- rgba(0, 0, 0, 0.08)
- rgba(0, 0, 0, 0.12)
- rgba(0, 0, 0, 0.05)
- rgba(255, 255, 255, 0.15)
- white (keyword)

## Tailles de police
- 12px
- 13px
- 14px
- 15px
- 16px
- 18px
- 20px
- 24px
- 32px

## Espacements recurrents (padding/margin/gap)
- 2px / 4px / 6px / 8px / 10px / 12px / 15px
- 18px / 20px / 25px / 30px / 40px
- radius: 4px / 6px / 8px / 10px / 12px / 20px / 999px

## Classes Bootstrap utilisees
- Aucune classe Bootstrap definie dans les CSS extraits.
- Note: les templates des widgets utilisent des classes Bootstrap (row, col-*, btn, alert), mais elles ne sont pas declarees dans les CSS extraits.

## Classes custom
- `fha-doc-*` (documentation): `fha-doc-container`, `fha-doc-header`, `fha-doc-nav`, `fha-doc-section`, `fha-doc-table`, `fha-doc-list`, `fha-doc-meta`, `fha-doc-actions`, `fha-doc-action-btn`, `fha-doc-divider`, `fha-doc-subtitle`
- `fha-severity-*`, `fha-score-*`, `fha-code-*`, `fha-info-box*`
- `fha-arch-*` (architecture): `fha-arch-visual`, `fha-arch-layer`, `fha-arch-ui`, `fha-arch-entry`, `fha-arch-engine`, `fha-arch-context`, `fha-arch-box*`, `fha-arch-methods`, `fha-arch-check*`
- `fha-option-card`, `fha-feature-grid`, `fha-feature-card`
- `fha-doc-nav-btn` (state `.active`, `:hover`)

## Problemes detectes
- Deux widgets (`fha_dashboard`, `fha_analysis_detail`) n'ont pas de CSS local, tandis que `fha-documentation` embarque une feuille complete -> sources de styles incoherentes.
- Palette tres large (beaucoup de nuances proches) -> risque d'incoherences visuelles et maintenance lourde.
- Couleurs et espacements hardcodes (nombreuses valeurs litterales) -> absence de variables/design tokens.
- Styles inline nombreux dans les templates des widgets (ex: `style="..."`) -> difficulte a centraliser et reutiliser le style.
- Aucun `!important` detecte (OK), mais forte dependance aux gradients/box-shadow hardcodes.

## Incoherences entre widgets
- Widgets 1 & 2 utilisent le theme global, widget 3 embarque une feuille CSS locale complete.
- Le design system n'est pas uniformise: le widget documentation impose une palette et des espacements propres.
