# CLEANUP_REPORT_PHASE1

## Contexte
Analyse des 9 Script Includes signales comme inactifs, a partir des fichiers XML dans `d852994c8312321083e1b4a6feaad3e6/update/`, avec verification de l'attribut `<active>` et recherche de references dans les Script Includes actifs.

## Script Includes analyses

| Script Include | Active | sys_id | Fichier XML | References dans Script Includes actifs | Recommandation |
| --- | --- | --- | --- | --- | --- |
| FHCheckTable | false | 99f80240835a321083e1b4a6feaad361 | `sys_script_include_99f80240835a321083e1b4a6feaad361.xml` | Aucune reference | Safe to delete |
| FHCheckAutomation | false | 7209c240835a321083e1b4a6feaad310 | `sys_script_include_7209c240835a321083e1b4a6feaad310.xml` | Aucune reference | Safe to delete |
| FHCheckIntegration | false | 16190640835a321083e1b4a6feaad322 | `sys_script_include_16190640835a321083e1b4a6feaad322.xml` | Aucune reference | Safe to delete |
| FHCheckSecurity | false | 65cdccfc831a761083e1b4a6feaad30c | `sys_script_include_65cdccfc831a761083e1b4a6feaad30c.xml` | Doublon actif: `sys_script_include_security_12345678901234567890123456789012.xml` (active=true) | Needs review |
| FHCheckRegistry | false | 820602c8831a321083e1b4a6feaad34d | `sys_script_include_820602c8831a321083e1b4a6feaad34d.xml` | Aucune reference | Safe to delete |
| FHAnalysisContext | false | f17a0204835a321083e1b4a6feaad360 | `sys_script_include_f17a0204835a321083e1b4a6feaad360.xml` | Reference en commentaire dans `sys_script_include_security_12345678901234567890123456789012.xml` | Needs review |
| FHOptionsHandler | false | 268399a08392361083e1b4a6feaad34e | `sys_script_include_268399a08392361083e1b4a6feaad34e.xml` | Aucune reference | Safe to delete |
| FHScanUtils | false | df241fac8352761083e1b4a6feaad360 | `sys_script_include_df241fac8352761083e1b4a6feaad360.xml` | Reference commentee dans `sys_script_include_033a4751531a3610c7233ee0a0490e0f.xml` (FHAnalysisEngine) | Needs review |
| FHAUtils | true | aaaafeed53163610c7233ee0a0490abc | `sys_script_include_aaaafeed53163610c7233ee0a0490abc.xml` | Script Include actif | Needs review |

## Script Includes actifs analyses pour les references
- `sys_script_include_security_12345678901234567890123456789012.xml` (FHCheckSecurity)
- `sys_script_include_f27265808316321083e1b4a6feaad33d.xml` (FHAnalyzer)
- `sys_script_include_cccafeed53163610c7233ee0a0490abc.xml` (FHARuleEvaluator)
- `sys_script_include_aaaafeed53163610c7233ee0a0490abc.xml` (FHAUtils)
- `sys_script_include_033a4751531a3610c7233ee0a0490e0f.xml` (FHAnalysisEngine)

