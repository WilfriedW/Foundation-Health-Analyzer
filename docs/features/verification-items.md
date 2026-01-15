# Verification Items

## Role
A verification item defines what to analyze (table, query, fields) and which rules to apply.

## Table
`x_1310794_founda_0_verification_items`

## Main fields
| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Display name |
| `category` | choice | automation, integration, security, UI |
| `table` | reference | Table ServiceNow cible |
| `query_type` | choice | `encoded` or `script` |
| `query_value` | string | Encoded query (with `{0}` for table_name) |
| `query_script` | script | Script that fills `scriptResults` with sys_id |
| `fields` | string | CSV list of fields to extract |
| `metadata` | string (JSON) | Icon, color, label, record_type |
| `issue_rules` | glide_list | Associated rules |

## Example (encoded query)
```json
{
  "name": "Flows",
  "category": "automation",
  "table": "sys_hub_flow",
  "query_type": "encoded",
  "query_value": "trigger_table={0}^active=true",
  "fields": "name,active,sys_created_by,sys_updated_by",
  "issue_rules": "<sys_id1>,<sys_id2>",
  "metadata": "{\"displayName\":\"Flows\",\"icon\":\"fa-project-diagram\",\"color\":\"#17a2b8\"}"
}
```

## Example (script)
The script must populate a `scriptResults` list of sys_id or records.
```javascript
// query_script
scriptResults = [];
var gr = new GlideRecord('sys_hub_flow');
gr.addQuery('active', true);
gr.query();
while (gr.next()) {
  scriptResults.push(gr.getUniqueValue());
}
```

## Best practices
- Always include `name`, `active`, `sys_created_by`, `sys_updated_by` in `fields`.
- Use `metadata` for coherent UI (icon, color).
- Limit query scope to avoid full table scans.
