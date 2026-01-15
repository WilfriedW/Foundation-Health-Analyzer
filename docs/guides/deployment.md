# Guide de deploiement

## Pre-requis
- Instance ServiceNow avec Service Portal actif
- Acces admin pour importer les Update Sets

## Installation via Source Control
1. Importer le repo dans ServiceNow (Source Control).
2. Publier les update sets.
3. Verifier les roles FHA.

## Installation via Update Set
1. Importer les fichiers `d852.../update/*.xml`.
2. Previsualiser et committer les changements.
3. Publier l application.

## Validation post-deploiement
- Verifier les tables: `x_1310794_founda_0_configurations`, `x_1310794_founda_0_results`.
- Tester `/fha` et `/fha?id=fha_documentation`.
- Tester l API `GET /api/x_1310794_founda_0/fha/statistics`.
