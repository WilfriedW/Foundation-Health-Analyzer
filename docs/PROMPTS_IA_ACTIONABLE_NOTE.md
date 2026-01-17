# 📝 Note sur les Prompts Actionnables

## 🎯 Philosophie

Les prompts dans **PROMPTS_IA_DEVELOPPEMENT.md** sont conçus pour que l'IA **FASSE LES ACTIONS** directement, pas juste retourner du code.

---

## ✅ Bon Exemple (Actionable)

```
TÂCHE :
1. **LIS** le fichier d852994c8312321083e1b4a6feaad3e6/update/sp_widget_XXX.xml
2. **MODIFIE** la section <css> avec le nouveau CSS
3. **SAUVEGARDE** le fichier modifié
4. **CRÉE** un fichier CHANGELOG.md documentant les changements

**MODIFIE LE FICHIER DIRECTEMENT - Ne me retourne pas juste du code !**
```

**Résultat** : L'IA lit le fichier, le modifie, le sauvegarde. Vous n'avez qu'à commit et tester.

---

## ❌ Mauvais Exemple (Non-actionable)

```
TÂCHE :
Crée-moi le CSS pour le widget Dashboard.

FORMAT :
```css
/* CSS ici */
```

Retourne le CSS complet.
```

**Problème** : L'IA retourne juste du CSS. Vous devez manuellement :
1. Copier le CSS
2. Ouvrir le fichier XML
3. Trouver la section <css>
4. Coller le nouveau CSS
5. Sauvegarder

---

## 🚀 Avantages des Prompts Actionnables

### Gain de Temps
- ❌ **Sans** : 5-10 min par prompt (copier-coller manuel)
- ✅ **Avec** : 30 secondes (valider et commit)

### Moins d'Erreurs
- ❌ **Sans** : Risque de copier au mauvais endroit, oublier des guillemets, etc.
- ✅ **Avec** : L'IA fait les modifications précisément

### Workflow Fluide
- ❌ **Sans** : Copier → Ouvrir fichier → Chercher → Remplacer → Sauver → Tester
- ✅ **Avec** : Valider → Commit → Tester

---

## 🤖 IAs Recommandées

### ✅ Claude (claude.ai ou API)
- Peut lire et écrire des fichiers
- Parfait pour ServiceNow
- Comprend bien les XML
- **RECOMMANDÉ**

### ✅ Cursor AI (cursor.sh)
- Éditeur avec IA intégrée
- Accès direct aux fichiers
- Modifications en temps réel
- **EXCELLENT POUR CE WORKFLOW**

### ⚠️ ChatGPT Web
- Pas d'accès direct aux fichiers
- Peut générer du code mais vous devez copier-coller
- Moins optimal pour ce workflow

### ❌ ChatGPT sans plugins
- Seulement génération de code
- Pas d'actions sur fichiers

---

## 📋 Structure des Prompts Actionnables

Chaque prompt suit cette structure :

```
### Titre du Prompt

```
CONTEXTE :
- Chemin des fichiers
- État actuel
- Objectif

TÂCHE :
1. **LIS** [fichier/dossier]
2. **ANALYSE** [ce qu'il faut chercher]
3. **MODIFIE** [ce qu'il faut changer]
4. **CRÉE** [nouveaux fichiers si nécessaire]
5. **GÉNÈRE** [rapport/documentation]

EXIGENCES :
- Backup avant modification
- Logger les actions
- Vérifier avant de supprimer

**FAIS LES ACTIONS DIRECTEMENT - Ne me retourne pas juste du code !**

Après validation, je pourrai [prochaine étape].
```
```

---

## 🎯 Workflow Complet

### 1. Vous lancez le prompt
```
[Copier-coller le prompt dans Claude/Cursor]
```

### 2. L'IA fait les actions
```
✅ Lit les fichiers
✅ Analyse le code
✅ Modifie les fichiers XML
✅ Crée nouveaux fichiers
✅ Génère rapports
```

### 3. Vous validez
```bash
# Voir les changements
git status
git diff

# Si OK
git add .
git commit -m "Phase 1.1: Cleanup composants obsolètes"
```

### 4. Vous testez
```
1. Push vers ServiceNow (si Source Control)
2. OU Import des fichiers modifiés
3. Tester l'application
```

### 5. Passez au prompt suivant
```
[Lancer Prompt 1.2]
```

---

## 💡 Exemples Concrets

### Exemple 1 : Nettoyage Script Includes

**Prompt 1.1** :
- ✅ L'IA cherche les 9 Script Includes obsolètes
- ✅ Génère rapport CLEANUP_REPORT_STEP1.md

**Prompt 1.2** :
- ✅ L'IA lit le rapport
- ✅ Supprime les fichiers XML (après backup)
- ✅ Génère CLEANUP_ACTIONS.md

**Vous** :
- Validez les suppressions
- Commit
- Testez l'application

---

### Exemple 2 : Refonte CSS

**Prompt 2.2** :
- ✅ L'IA crée le Design System (5 fichiers)

**Prompt 2.3** :
- ✅ L'IA lit le widget XML
- ✅ Extrait le CSS actuel
- ✅ Réécrit le CSS avec le Design System
- ✅ Modifie le fichier XML
- ✅ Génère CHANGELOG

**Vous** :
- Validez le nouveau CSS
- Commit
- Importez dans ServiceNow
- Testez visuellement

---

### Exemple 3 : Nouvelle Fonctionnalité

**Prompt 3.2** :
- ✅ L'IA lit le widget Dashboard actuel
- ✅ Ajoute les statistiques en temps réel (HTML + AngularJS + Server script)
- ✅ Modifie le fichier XML
- ✅ Crée la documentation

**Vous** :
- Validez les changements
- Commit
- Importez dans ServiceNow
- Testez la nouvelle feature

---

## 🛠️ Adaptation pour Votre Workflow

Si vous utilisez **Source Control** :
```bash
# Les modifications XML sont automatiquement détectées
cd /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/
git status
git add .
git commit -m "..."
git push

# ServiceNow pull automatiquement les changements
```

Si vous utilisez **Import manuel** :
```bash
# Après que l'IA a modifié les fichiers
1. Aller dans ServiceNow
2. Retrieved Update Sets > Import XML
3. Sélectionner les fichiers modifiés
4. Preview > Commit
5. Tester
```

---

## 📊 Gain de Temps Estimé

| Méthode | Temps/Prompt | 27 Prompts | Total |
|---------|--------------|------------|-------|
| **Non-actionable** (copier-coller) | 5-10 min | 27 prompts | **2-4h** |
| **Actionnable** (validation seulement) | 1-2 min | 27 prompts | **30-60 min** |
| **GAIN** | **75-80%** | - | **2-3h économisées** |

---

## ✅ Checklist pour Chaque Prompt

Avant de lancer un prompt, vérifiez :
- [ ] L'IA peut accéder aux fichiers (Claude/Cursor)
- [ ] Les chemins dans le prompt sont corrects
- [ ] Vous avez fait un backup (git commit avant)

Après que l'IA ait terminé :
- [ ] Vérifiez les modifications (git diff)
- [ ] Lisez le rapport/changelog généré
- [ ] Validez que tout est correct
- [ ] Commit les changements
- [ ] Testez dans ServiceNow

---

## 🚀 Prêt à Utiliser

Maintenant, tous les prompts dans **PROMPTS_IA_DEVELOPPEMENT.md** suivent cette philosophie.

**Lancez simplement le Prompt 1.1 et laissez l'IA travailler ! 🎉**

---

**Créé par** : Claude (Expert ServiceNow)  
**Date** : 17 janvier 2026  
**Pour** : Wilfried Waret
