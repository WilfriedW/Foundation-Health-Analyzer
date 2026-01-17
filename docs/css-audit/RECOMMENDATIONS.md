# Recommandations CSS

## Couleurs a standardiser
- Definir une palette FHA: primaire (#1a5a96), secondaire (#2980b9), neutres (#f8fafc/#e2e8f0/#555555/#333333)
- Regrouper les couleurs d'etat: succes (#059669 / #d1fae5), warning (#d97706 / #fef3c7), danger (#dc2626 / #fee2e2), info (#2563eb / #dbeafe)
- Remplacer les variations proches par 1 a 2 niveaux par role (ex: gris 100/300/600)

## Espacements a unifier
- Adopter une echelle: 4, 8, 12, 16, 20, 24, 32, 40
- Remplacer les valeurs hors echelle par la valeur la plus proche
- Standardiser les rayons: 4, 8, 12 (eviter 10/20/999 sauf badges)

## Variables CSS a creer
- Couleurs: `--fha-primary`, `--fha-primary-light`, `--fha-text`, `--fha-muted`, `--fha-border`, `--fha-bg`, `--fha-surface`
- Etats: `--fha-success`, `--fha-warning`, `--fha-danger`, `--fha-info`
- Espacements: `--fha-space-1` a `--fha-space-8`
- Radius: `--fha-radius-sm`, `--fha-radius-md`, `--fha-radius-lg`
- Ombres: `--fha-shadow-sm`, `--fha-shadow-md`

## Priorite des changements
1. Centraliser la palette dans le theme FHA et remplacer les couleurs hardcodees du widget documentation.
2. Migrer les styles inline des templates vers des classes CSS reutilisables.
3. Harmoniser les spacings et radius sur l'echelle definie.
4. Documenter les tokens (palette/spacings) dans le guide design.
