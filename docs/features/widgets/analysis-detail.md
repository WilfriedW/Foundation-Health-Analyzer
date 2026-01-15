# Widget FHA Analysis detail

**Widget**: `FHA Analysis detail` (`sp_widget_3ee88bd48312f21083e1b4a6feaad39a.xml`)  
**Page associee**: `fha_analysis_results` (voir update set)

## Description
Affiche un resultat d analyse (statistiques, tabs par categorie, issues, export JSON/PDF).

## URL et parametres
- URL type: `/fha?id=fha_analysis_results&sys_id=<result_sys_id>`
- Parametre principal: `sys_id` (result sys_id)

## Flux de donnees
1. Le serveur lit `x_1310794_founda_0_results.details`.
2. Le client utilise `c.result.result.data` et `c.result.issues` pour l affichage.

## Fonctionnalites
- Tabs dynamiques par categorie
- Filtrage par severite, type, recherche
- Export JSON (`download`) et PDF (`window.print()`)

## Champs consommes (extrait)
| Champ | Source | Usage |
| --- | --- | --- |
| `result.result.data[]` | JSON | Liste de records par categorie |
| `result.issues[]` | JSON | Issues agregees |
| `result.config` | JSON | Config affichee dans Overview |

## Incoherences connues
- Le template utilise `c.openRecord(...)` sans definition dans le controller.
  - Impact: lien record inoperant dans l onglet Issues.

## Liens
- Workflow d analyse: `docs/features/analysis-workflow.md`
- API /analysis: `docs/api/endpoints.md`
