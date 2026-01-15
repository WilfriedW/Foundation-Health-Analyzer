# API REST

Base URL: `https://<instance>.service-now.com/api/x_1310794_founda_0/fha`

## Endpoints
| Endpoint | Methode | Description |
| --- | --- | --- |
| `/tables` | GET | Lister les configurations disponibles |
| `/analyze/{table_name}` | POST | Lancer une analyse par nom de table |
| `/analyze_by_config/{config_sys_id}` | GET | Lancer une analyse par configuration |
| `/analysis/{analysis_id}` | GET | Lire un resultat d analyse |
| `/statistics` | GET | Statistiques globales |
| `/history` | GET | Historique pagine |
| `/fields` | GET | Champs custom + fill rate |
| `/report/word` | POST | Generer un rapport Word/PDF |

## Authentification
Tous les endpoints requierent authentification et ACLs ServiceNow.

## Incoherences a surveiller
Plusieurs scripts REST utilisent les tables suffixees `_fha_*` (ex: `x_1310794_founda_0_fha_results`) alors que le moteur principal utilise `x_1310794_founda_0_results`.
