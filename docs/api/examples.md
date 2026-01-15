# API Examples

## GET /tables
```http
GET /api/x_1310794_founda_0/fha/tables
Authorization: Basic <credentials>
```

## POST /analyze/{table_name}
```http
POST /api/x_1310794_founda_0/fha/analyze/incident
Content-Type: application/json
Authorization: Basic <credentials>

{
  "deep_scan": true
}
```

## GET /analysis/{analysis_id}
```http
GET /api/x_1310794_founda_0/fha/analysis/abc123def456
Authorization: Basic <credentials>
```

## GET /history
```http
GET /api/x_1310794_founda_0/fha/history?limit=10&offset=0&status=completed
Authorization: Basic <credentials>
```

## POST /report/word
```http
POST /api/x_1310794_founda_0/fha/report/word
Content-Type: application/json
Authorization: Basic <credentials>

{
  "analysis_sys_id": "abc123def456"
}
```
