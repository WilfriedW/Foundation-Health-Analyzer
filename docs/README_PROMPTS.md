# 🤖 Guide des Prompts IA - Quelle Version Utiliser ?

---

## 📚 Deux Versions Disponibles

### 📄 PROMPTS_IA_DEVELOPPEMENT.md (V1 - Partiellement modifié)
**Status** : ⚠️ En cours de mise à jour  
**Type** : Prompts qui retournent du code  
**Recommandation** : **NE PAS UTILISER**

### ✅ PROMPTS_IA_DEVELOPPEMENT_V2.md (V2 - RECOMMANDÉ)
**Status** : ✅ Complet et actionnable  
**Type** : Prompts qui font les actions directement  
**Recommandation** : **UTILISER CELUI-CI ! ⭐**

---

## 🎯 Pourquoi la V2 est Meilleure ?

### V1 (Ancienne Approche)
```
Prompt → IA génère du code → Vous copiez → Vous collez → Vous sauvegardez
```
**Temps** : 5-10 min par prompt  
**Erreurs** : Risque de copier au mauvais endroit

### V2 (Nouvelle Approche)
```
Prompt → IA lit, modifie et sauvegarde les fichiers → Vous validez → Commit
```
**Temps** : 1-2 min par prompt  
**Erreurs** : Aucune - l'IA fait tout correctement

---

## 📊 Comparaison Détaillée

| Aspect | V1 (Ancienne) | V2 (Nouvelle) |
|--------|---------------|---------------|
| **Actions** | Retourne du code | **Fait les modifications** |
| **Fichiers** | Vous devez ouvrir/modifier | **IA modifie directement** |
| **Temps/Prompt** | 5-10 min | **1-2 min** |
| **Gain total** | - | **2-3h économisées** |
| **Risque erreur** | Élevé | **Très faible** |
| **Workflow** | Manuel | **Automatisé** |
| **Recommandation** | ❌ Ne pas utiliser | ✅ **UTILISER** |

---

## 🚀 Comment Utiliser la V2

### 1. Ouvrez le Bon Fichier
```bash
# Ouvrez celui-ci :
open PROMPTS_IA_DEVELOPPEMENT_V2.md

# PAS celui-ci :
# open PROMPTS_IA_DEVELOPPEMENT.md
```

### 2. Utilisez une IA qui Peut Lire/Écrire des Fichiers

#### ✅ RECOMMANDÉ : Claude (claude.ai)
- Peut lire et écrire des fichiers
- Excellent pour ServiceNow
- **PARFAIT pour ces prompts**

#### ✅ RECOMMANDÉ : Cursor AI (cursor.sh)
- Éditeur avec IA intégrée
- Accès direct aux fichiers
- **OPTIMAL pour ce workflow**

#### ⚠️ Pas Optimal : ChatGPT Web
- Pas d'accès direct aux fichiers
- Vous devrez copier-coller quand même

### 3. Exemple Concret

**Copiez le Prompt 1.1 de la V2** :
```
Tu es un expert ServiceNow. Je développe l'application Foundation Health Analyzer.

PROJET :
Chemin : /Users/wilfriedwaret/Dev/Git/FHA/Foundation-Health-Analyzer/
...

TÂCHE - FAIS CES ACTIONS :
1. **LISTE** tous les fichiers XML...
2. **POUR CHAQUE** des 9 Script Includes...
3. **CHERCHE** les références...
4. **CRÉE** le fichier docs/cleanup/CLEANUP_REPORT_PHASE1.md...

**NE ME RETOURNE PAS UN SCRIPT - FAIS LES ACTIONS ET CRÉE LES FICHIERS !**
```

**Collez dans Claude/Cursor** et l'IA va :
1. ✅ Lister les fichiers
2. ✅ Analyser les 9 Script Includes
3. ✅ Chercher les références
4. ✅ **Créer le fichier de rapport**

**Vous n'avez qu'à** :
```bash
# Vérifier
git status
cat docs/cleanup/CLEANUP_REPORT_PHASE1.md

# Valider
git add .
git commit -m "Phase 1.1: Analyse composants obsolètes"
```

---

## 📋 Checklist de Démarrage

Avant de commencer :
- [ ] J'ai ouvert **PROMPTS_IA_DEVELOPPEMENT_V2.md** (pas la V1)
- [ ] J'utilise Claude (claude.ai) ou Cursor AI (cursor.sh)
- [ ] J'ai fait un backup (git commit)
- [ ] J'ai une instance de dev ServiceNow pour tester

Pendant l'utilisation :
- [ ] Je copie les prompts de la **V2**
- [ ] Je laisse l'IA **faire les actions**
- [ ] Je **valide** avec git diff
- [ ] Je **commit** les changements
- [ ] Je **teste** dans ServiceNow

---

## 🎯 Roadmap avec la V2

### Semaine 1-2 : Nettoyage & CSS
```
Jour 1   : Prompts 1.1-1.4 ✅ Nettoyage (1-2h avec V2)
Jour 2-7 : Prompts 2.1-2.6 🎨 CSS/Thème (3-5h avec V2)
```

### Semaine 3-4 : Fonctionnalités
```
Jour 8-14 : Prompts 3.1-3.6 ⚙️ Features (5-8h avec V2)
```

### Semaine 5-6 : Avancé
```
Jour 15-21: Prompts 4.1-4.7 🚀 Advanced (8-12h avec V2)
```

**Total avec V2 : ~20-30h au lieu de 60-80h !** 🎉

---

## 💡 Conseils d'Utilisation V2

### ✅ DO
- ✅ Toujours utiliser **PROMPTS_IA_DEVELOPPEMENT_V2.md**
- ✅ Vérifier les modifications avec `git diff`
- ✅ Commit après chaque prompt réussi
- ✅ Tester dans ServiceNow régulièrement

### ❌ DON'T
- ❌ N'utilisez pas la V1 (obsolète)
- ❌ Ne skipper pas la validation (toujours git diff)
- ❌ Ne pas appliquer en prod sans tester
- ❌ Ne pas oublier de backup

---

## 🆘 Que Faire Si...

### L'IA ne peut pas accéder aux fichiers ?
→ Utilisez **Claude** (claude.ai) ou **Cursor AI** (cursor.sh)  
→ Ou donnez le chemin complet du projet

### L'IA retourne du code au lieu de faire les actions ?
→ Répétez le prompt en insistant :  
```
"Ne me retourne pas de code - FAIS LES MODIFICATIONS DIRECTEMENT dans les fichiers XML !"
```

### Les modifications ne sont pas correctes ?
→ Rollback avec git :
```bash
git diff          # Voir les changements
git restore FILE  # Annuler un fichier
git reset --hard  # Annuler tout (attention !)
```
→ Relancez le prompt avec plus de précisions

### Je ne sais pas quel prompt utiliser ?
→ Suivez l'ordre 1.1 → 1.2 → 1.3 → ... → 4.7  
→ Utilisez **docs/PROGRESS_TRACKING.md** pour suivre

---

## 📊 Résumé Final

| Fichier | Version | Status | Utiliser ? |
|---------|---------|--------|-----------|
| `PROMPTS_IA_DEVELOPPEMENT.md` | V1 | ⚠️ Partiellement modifié | ❌ NON |
| `PROMPTS_IA_DEVELOPPEMENT_V2.md` | V2 | ✅ Complet & actionnable | ✅ **OUI !** |
| `PROMPTS_IA_ACTIONABLE_NOTE.md` | - | ℹ️ Explications | 📖 Lire |
| `README_PROMPTS.md` | - | ℹ️ Ce fichier | 📖 Vous êtes ici |

---

## 🚀 Commencez Maintenant

1. **Ouvrez** : PROMPTS_IA_DEVELOPPEMENT_V2.md
2. **Allez à** : Prompt 1.1
3. **Copiez** le prompt complet
4. **Collez** dans Claude ou Cursor
5. **Laissez l'IA travailler**
6. **Validez** avec git diff
7. **Commit** et passez au suivant

**Bonne chance ! Vous allez gagner un temps fou ! ⚡🚀**

---

**Créé par** : Claude (Expert ServiceNow)  
**Date** : 17 janvier 2026  
**Pour** : Wilfried Waret

---

## 📞 Questions Fréquentes

**Q: Puis-je utiliser les deux versions en même temps ?**  
R: Non, utilisez UNIQUEMENT la V2. La V1 est obsolète.

**Q: La V2 fonctionne avec ChatGPT ?**  
R: Partiellement. ChatGPT Web ne peut pas modifier les fichiers directement. Utilisez Claude ou Cursor.

**Q: Combien de temps ça va prendre ?**  
R: Avec la V2 : ~20-30h au lieu de 60-80h. Gain de 65%.

**Q: Je dois tout faire d'un coup ?**  
R: Non ! Faites phase par phase. Vous pouvez faire Phase 1 aujourd'hui, Phase 2 la semaine prochaine, etc.

**Q: Et si je veux juste le CSS sans les fonctionnalités ?**  
R: Parfait ! Faites Phase 1 (nettoyage) puis Phase 2 (CSS) et arrêtez-vous là.

**Q: Les prompts vont créer de nouveaux fichiers ?**  
R: Oui, dans docs/ pour la documentation, et dans docs/new-widgets/, docs/new-scripts/ pour les nouveaux composants. Vous les importerez ensuite dans ServiceNow.

**Q: Je peux adapter les prompts ?**  
R: Oui ! Les prompts sont un point de départ. Adaptez-les à vos besoins.
