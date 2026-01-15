# Guide de tests

## Etat actuel
Aucun framework de tests automatise n est present dans le depot.

## Recommandations
- Ajouter des tests de regression pour:
  - `FHAnalyzer.runAnalysis`
  - `FHAnalysisEngine.runVerification`
  - `FHARuleEvaluator.evaluate`
- Creer des jeux de donnees de test (tables temporaires) pour:
  - verification items
  - issue rules

## Checklist manuelle
- Lancer une analyse via portail.
- Verifier l affichage des issues par categorie.
- Tester l export JSON/PDF.
- Tester l API `/analysis/{analysis_id}`.
