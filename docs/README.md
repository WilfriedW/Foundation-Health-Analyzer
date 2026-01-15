# Foundation Health Analyzer (FHA) Documentation

## Purpose
This documentation describes the ServiceNow application "Foundation Health Analyzer" (scope `x_1310794_founda_0`), its components, APIs, and usage guides. It is based on the Update Set files and the Service Portal widgets.

## Quick start
- Import the application via Source Control or Update Set.
- Verify roles: `x_1310794_founda_0.admin` or `x_1310794_founda_0.user`.
- Portal access: `/fha`.
- Documentation page: `/fha?id=fha_documentation`.

## Contents
- Architecture: `docs/architecture.md`
- Features:
  - Analysis workflow: `docs/features/analysis-workflow.md`
  - Verification items: `docs/features/verification-items.md`
  - Issue rules: `docs/features/issue-rules.md`
  - Widgets:
    - FHA Documentation (ID 277a...): `docs/features/widgets/277a975c8392f21083e1b4a6feaad318.md`
    - Analysis detail: `docs/features/widgets/analysis-detail.md`
- REST API:
  - Endpoints: `docs/api/endpoints.md`
  - Examples: `docs/api/examples.md`
- Guides:
  - Deployment: `docs/guides/deployment.md`
  - Testing: `docs/guides/testing.md`

## Compatibility and versions
- Application: `1.1.0` (see `CHANGELOG.md`).
- Platform: ServiceNow (instance version, see `glide.buildname`).

## File structure
The detailed tree is kept in `project_structure.txt`.
