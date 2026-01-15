# Issue Rules

## Role
Issue rules define anomaly detectors applied to records returned by verification items.

## Table
`x_1310794_founda_0_issue_rules`

## Fields
| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Functional name |
| `code` | string | Issue code (e.g. `NO_READ_ACL`) |
| `type` | string | Rule type (internal handler) |
| `severity` | string | `low`, `medium`, `high` |
| `params` | string (JSON) | Handler parameters |
| `script` | script | Optional custom script |
| `description` | string | Functional description |

## Available handlers (FHARuleEvaluator)
- `inactive`, `system_created`, `count_threshold`
- `missing_field`, `missing_acl`, `acl_issue`
- `index_needed`, `size_threshold`, `risky_field`
- `duplicate`, `public_endpoint`, `public_access`
- `br_density`, `br_heavy`, `cs_heavy`, `ui_action`
- `job_error`, `job_inactive`
- `flow_error`, `flow_config`
- `notification`
- `integration_error`, `integration_config`
- `hardcoded_sys_id`
- `widget_perf`, `query_scan`, `script_weight`, `audit`, `security`, `catalog`, `mail_config`, `observability`

## Common params
| Param | Example | Usage |
| --- | --- | --- |
| `threshold` | `10` | counting threshold (`count_threshold`, `br_density`) |
| `fields` | `script,query_script` | fields to scan (`hardcoded_sys_id`) |
| `field` | `description` | target field (`missing_field`, `size_threshold`) |
| `max_len` | `4000` | max length (`size_threshold`) |
| `allowed_tables` | `sys_user,incident` | filter by table |
| `allowed_categories` | `security,automation` | filter by category |

## Example rule (hardcoded sys_id)
```json
{
  "name": "Hardcoded sys_id",
  "code": "HARDCODED_SYSID",
  "type": "hardcoded_sys_id",
  "severity": "medium",
  "params": "{\"fields\":\"script,query_script\"}",
  "script": ""
}
```

## Custom script
The script can return a list of issues.
```javascript
// script field
if ((item.values.name || '').indexOf('Test') === 0) {
  return [issue(rule, 'Naming rule violated')];
}
return [];
```

## Security
- Scripts are executed via `new Function(...)` in `FHARuleEvaluator`.
- Limit access to FHA roles and test in sub-prod.
