# Guide : Ajouter le Nouveau Widget à la Page

> **Guide rapide** pour créer et ajouter le widget FHA Documentation v2 dans ServiceNow

---

## 🎯 Étape 1 : Créer le Nouveau Widget

### Dans ServiceNow Studio

1. Ouvrez **Studio**
2. Naviguez vers **Service Portal > Widgets**
3. Cliquez sur **Create New** (bouton en haut à droite)

### Configuration du Widget

Remplissez les champs :

- **Widget Name** : `FHA Documentation v2`
- **Widget ID** : `fha-documentation-v2`
- **Category** : `Custom`
- **Description** : `Complete documentation widget for Foundation Health Analyzer`

### Cliquez sur **Submit**

---

## 🎯 Étape 2 : Copier le Code

### Ouvrez le fichier XML

Le fichier est : `FHA_DOCUMENTATION_WIDGET_READY.xml`

### Méthode Facile : Copier section par section

Dans le widget que vous venez de créer, vous avez 4 onglets. Copiez le contenu entre les balises XML correspondantes :

#### 📝 Onglet "HTML Template"
Copiez tout ce qui est entre `<template><![CDATA[` et `]]></template>`

#### 🎨 Onglet "CSS"
Copiez tout ce qui est entre `<css>` et `</css>`

#### 💻 Onglet "Client Script"
Copiez tout ce qui est entre `<client_script><![CDATA[` et `]]></client_script>`

#### ⚙️ Onglet "Server Script"
Copiez tout ce qui est entre `<script><![CDATA[` et `]]></script>`

### Sauvegardez après chaque section !

---

## 🎯 Étape 3 : Ajouter le Widget à votre Page

### Option A : Modifier la page existante

1. Dans Studio, allez dans **Service Portal > Pages**
2. Trouvez votre page **FHA Documentation** (page ID: `fha_documentation`)
3. Ouvrez-la
4. Dans le **Page Designer** :
   - Supprimez l'ancien widget (si présent)
   - Glissez-déposez le nouveau widget **"FHA Documentation v2"**
5. Sauvegardez la page

### Option B : Créer une nouvelle page

1. **Service Portal > Pages** > **Create New**
2. Configuration :
   - **Page Name** : `FHA Documentation v2`
   - **Page ID** : `fha_documentation_v2`
3. Dans le **Page Designer** :
   - Créez une Row (ligne)
   - Ajoutez une Column (colonne pleine largeur)
   - Glissez-déposez le widget **"FHA Documentation v2"** dans la colonne
4. Sauvegardez

---

## 🎯 Étape 4 : Tester

Accédez à votre page :
- **Si nouvelle page** : `/fha?id=fha_documentation_v2`
- **Si page existante** : `/fha?id=fha_documentation`

### Ce que vous devriez voir :

✅ Header bleu avec gradient  
✅ Navigation sticky avec 10 boutons  
✅ Statistics cards avec chiffres  
✅ Design moderne et responsive  
✅ Boutons "Go to Dashboard" et "View Results" fonctionnels  

---

## 🚨 En cas de problème

### Le widget ne s'affiche pas

1. Vérifiez la console JavaScript (F12) pour les erreurs
2. Assurez-vous d'avoir copié TOUT le code de chaque section
3. Videz le cache (Cmd+Shift+R / Ctrl+Shift+R)

### Erreur "Widget not found"

1. Vérifiez que le widget est bien créé dans Studio
2. Vérifiez le Widget ID : `fha-documentation-v2`
3. Re-sauvegardez le widget

### Le design ne s'affiche pas correctement

1. Vérifiez que le CSS a bien été copié
2. Vérifiez qu'il n'y a pas d'autres CSS qui entre en conflit
3. Inspectez l'élément (clic droit > Inspecter) pour voir les styles appliqués

---

## 📋 Checklist Complète

- [ ] Widget créé avec le bon ID : `fha-documentation-v2`
- [ ] HTML Template copié et sauvegardé
- [ ] CSS copié et sauvegardé
- [ ] Client Script copié et sauvegardé
- [ ] Server Script copié et sauvegardé
- [ ] Widget ajouté à une page
- [ ] Page sauvegardée
- [ ] Test effectué : page s'affiche correctement
- [ ] Navigation fonctionne (cliquer sur les boutons de nav)
- [ ] Scroll-spy fonctionne (la section active change en scrollant)
- [ ] Boutons d'action fonctionnent

---

## 🎨 Personnalisation (Optionnel)

Pour changer les couleurs, modifiez les variables CSS dans l'onglet CSS :

```css
:root {
  --fha-primary: #1a5a96;      /* Bleu principal */
  --fha-success: #059669;      /* Vert */
  --fha-warning: #d97706;      /* Orange */
  --fha-danger: #dc2626;       /* Rouge */
}
```

---

## ✅ Résultat Final

Vous aurez un widget de documentation moderne avec :
- 🎨 Design professionnel
- 📊 Statistics en temps réel
- 🧭 Navigation intelligente
- 📱 100% responsive
- ⚡ Animations fluides

**Prêt à impressionner ! 🚀**
