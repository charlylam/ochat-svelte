# 🚀 Guide d'installation - Ochat

Ce guide détaille toutes les étapes nécessaires pour installer et configurer l'application Ochat sur votre machine.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** version 18 ou supérieure ([Télécharger Node.js](https://nodejs.org/))
- **npm** (inclus avec Node.js)
- **Git** ([Télécharger Git](https://git-scm.com/))
- Un éditeur de code (recommandé : [VS Code](https://code.visualstudio.com/))

### Vérifier vos installations

```bash
node --version  # Doit afficher v18.x ou supérieur
npm --version   # Doit afficher 9.x ou supérieur
git --version   # Doit afficher 2.x ou supérieur
```

---

## 🔑 Étape 1 : Obtenir une clé API Mistral AI

### 1.1 Créer un compte Mistral AI (gratuit)

1. Rendez-vous sur [console.mistral.ai](https://console.mistral.ai/)
2. Cliquez sur **"Sign Up"** (ou "S'inscrire")
3. Créez votre compte avec votre email
4. Confirmez votre email

### 1.2 Générer une clé API

1. Une fois connecté, accédez à votre **Dashboard**
2. Dans le menu latéral, cliquez sur **"API Keys"**
3. Cliquez sur **"Create new key"** (ou "+ New API key")
4. Donnez un nom à votre clé (ex: "Ochat Development")
5. Cliquez sur **"Create"**
6. **IMPORTANT** : Copiez immédiatement votre clé et sauvegardez-la dans un endroit sûr
   - Format : `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ Cette clé ne sera affichée qu'une seule fois !

---

## 💾 Étape 2 : Installer PocketBase

PocketBase est une base de données légère qui ne nécessite aucune installation complexe.

### 2.1 Télécharger PocketBase

#### Sur Windows :

1. Rendez-vous sur [pocketbase.io/docs](https://pocketbase.io/docs/)
2. Cliquez sur **"Download"**
3. Téléchargez la version Windows (fichier `.zip`)
4. Extrayez le fichier ZIP dans le dossier du projet Ochat
5. Vous devriez avoir un fichier `pocketbase.exe`

#### Sur macOS :

```bash
cd votre-dossier-projet
# Télécharger PocketBase
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_darwin_amd64.zip -o pocketbase.zip

# Extraire
unzip pocketbase.zip

# Rendre exécutable
chmod +x pocketbase
```

#### Sur Linux :

```bash
cd votre-dossier-projet
# Télécharger PocketBase
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip

# Extraire
unzip pocketbase_0.22.0_linux_amd64.zip

# Rendre exécutable
chmod +x pocketbase
```

### 2.2 Lancer PocketBase

```bash
# Windows
./pocketbase.exe serve

# macOS / Linux
./pocketbase serve
```

Vous devriez voir :

```
> Server started at http://127.0.0.1:8090
```

**🔥 Important** : Laissez ce terminal ouvert ! PocketBase doit tourner en permanence.

### 2.3 Accéder à l'interface d'administration

1. Ouvrez votre navigateur
2. Allez sur : [http://127.0.0.1:8090/\_/](http://127.0.0.1:8090/_/)
3. Créez votre compte administrateur :
   - Email : votre@email.com
   - Mot de passe : choisissez un mot de passe sécurisé
4. Confirmez la création

---

## 🗄️ Étape 3 : Configurer la base de données PocketBase

### 3.1 Importer la configuration

Si vous préférez importer directement la configuration, créez un fichier `pb_schema.json` :

```json
[
  {
    "id": "conversations_id",
    "name": "conversations",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "title_id",
        "name": "title",
        "type": "text",
        "required": true,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null
  },
  {
    "id": "stockage_messages_id",
    "name": "stockage_messages",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "content_id",
        "name": "content",
        "type": "text",
        "required": true,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "id": "role_id",
        "name": "role",
        "type": "text",
        "required": true,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "id": "time_id",
        "name": "time",
        "type": "date",
        "required": true,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "id": "conversation_id",
        "name": "conversation_id",
        "type": "relation",
        "required": true,
        "options": {
          "collectionId": "conversations_id",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": []
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null
  }
]
```

**Pour importer :**

1. Dans l'interface admin PocketBase, allez dans **Settings** > **Import collections**
2. Collez le JSON ci-dessus
3. Cliquez sur **"Import"**

### 3.2 Créer les collections manuellement

#### Collection 1 : `conversations`

1. Dans l'interface admin PocketBase, cliquez sur **"Collections"**
2. Cliquez sur **"New collection"**
3. Configuration :
   - **Name** : `conversations`
   - **Type** : Base collection
4. Cliquez sur **"New field"** et ajoutez :
   - **Field name** : `title`
   - **Type** : Text
   - **Required** : Coché ✅
5. Cliquez sur **"Create"**

#### Collection 2 : `stockage_messages`

1. Cliquez à nouveau sur **"New collection"**
2. Configuration :
   - **Name** : `stockage_messages`
   - **Type** : Base collection
3. Ajoutez les champs suivants (cliquez sur **"New field"** pour chaque) :

   **Champ 1 - content :**
   - **Field name** : `content`
   - **Type** : Text
   - **Required** : Coché ✅

   **Champ 2 - role :**
   - **Field name** : `role`
   - **Type** : Text
   - **Required** : Coché ✅

   **Champ 3 - time :**
   - **Field name** : `time`
   - **Type** : Date
   - **Required** : Coché ✅

   **Champ 4 - conversation_id :**
   - **Field name** : `conversation_id`
   - **Type** : Relation
   - **Required** : Coché ✅
   - **Collection** : Sélectionnez `conversations`
   - **Cascade delete** : Coché ✅ (supprime les messages si la conversation est supprimée)

4. Cliquez sur **"Create"**

### 3.3 Vérifier la configuration

Dans l'interface admin, vous devriez voir :

- ✅ Collection `conversations` avec le champ `title`
- ✅ Collection `stockage_messages` avec les champs `content`, `role`, `time`, `conversation_id`

---

## 📦 Étape 4 : Installer le projet Ochat

### 4.1 Cloner le projet

```bash
# Avec HTTPS
git clone https://github.com/votre-username/ochat.git

# Ou avec SSH
git clone git@github.com:votre-username/ochat.git

# Accéder au dossier
cd ochat
```

### 4.2 Installer les dépendances

```bash
npm install
```

Cela va installer :

- Svelte et ses dépendances
- svelte-exmarkdown (pour le Markdown)
- Tous les outils de développement

**Temps d'installation** : 1-2 minutes selon votre connexion.

### 4.3 Vérifier la structure du projet

Votre dossier devrait ressembler à :

```
ochat/
├── src/
│   ├── App.svelte      # Votre fichier principal
│   ├── main.js
│   └── ...
├── public/
├── pocketbase.exe      # (Windows) ou pocketbase (Mac/Linux)
├── pb_data/            # Créé automatiquement par PocketBase
├── package.json
├── README.md
├── SETUP.md
└── ...
```

---

## 🎬 Étape 5 : Lancer l'application

### 5.1 Démarrer PocketBase (Terminal 1)

```bash
# Windows
./pocketbase.exe serve

# macOS / Linux
./pocketbase serve
```

Laissez ce terminal **ouvert**.

### 5.2 Démarrer l'application Svelte (Terminal 2)

Ouvrez un **nouveau terminal** et lancez :

```bash
npm run dev
```

Vous devriez voir :

```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 5.3 Accéder à l'application

1. Ouvrez votre navigateur
2. Allez sur : [http://localhost:5173](http://localhost:5173)
3. Vous devriez voir l'écran de connexion d'Ochat ! 🎉

---

## 🔐 Étape 6 : Première connexion

### 6.1 Se connecter à Ochat

1. **Nom d'utilisateur** : Entrez votre prénom (ex: "Marie")
2. **Clé API** : Collez votre clé API Mistral obtenue à l'étape 1
3. Cliquez sur **"ok"**

### 6.2 Vérification

Si tout fonctionne :

- ✅ Vous êtes redirigé vers l'interface de chat
- ✅ Vous voyez "Conversations" dans la sidebar
- ✅ Vous pouvez créer une nouvelle conversation

### 6.3 Résolution de problèmes

**❌ "Clé API invalide"**

- Vérifiez que vous avez copié toute la clé
- Assurez-vous que votre clé est active sur console.mistral.ai
- Vérifiez votre connexion internet

**❌ "Impossible de contacter le serveur Mistral"**

- Vérifiez votre connexion internet
- Vérifiez que l'API Mistral n'est pas en maintenance

**❌ "Impossible d'enregistrer le message dans PocketBase"**

- Vérifiez que PocketBase est bien lancé (terminal 1)
- Allez sur http://127.0.0.1:8090/_/ pour vérifier que l'admin fonctionne
- Vérifiez que les collections sont bien créées

---

## 🧪 Étape 7 : Tester l'application

### 7.1 Créer une conversation

1. Dans le champ "Nouvelle conversation", tapez : `Test de l'application`
2. Cliquez sur **"Créer"**
3. La conversation apparaît dans la liste

### 7.2 Envoyer un message

1. Dans le champ de saisie en bas, tapez : `Bonjour, peux-tu te présenter ?`
2. Appuyez sur **Entrée** ou cliquez sur la flèche
3. Votre message apparaît
4. Après quelques secondes, la réponse de l'IA apparaît

### 7.3 Tester les fonctionnalités

- ✅ Modifier le titre d'une conversation (bouton crayon)
- ✅ Supprimer une conversation (bouton X)
- ✅ Créer plusieurs conversations
- ✅ Naviguer entre les conversations
- ✅ Tester le responsive (réduire la fenêtre)

### 7.4 Vérifier dans PocketBase

1. Allez sur [http://127.0.0.1:8090/\_/](http://127.0.0.1:8090/_/)
2. Cliquez sur **"Collections"** > **"conversations"**
3. Vous devriez voir votre conversation "Test de l'application"
4. Cliquez sur **"stockage_messages"**
5. Vous devriez voir vos messages et les réponses de l'IA

---

## 🎨 Étape 8 : Personnalisation (optionnel)

### 8.1 Modifier les couleurs

Dans votre fichier CSS global (souvent `src/app.css` ou dans `<style>` de `App.svelte`), ajoutez :

```css
:root {
  --color-background-chat: #1e1e1e; /* Fond principal */
  --color-background-conversations: #2d2d2d; /* Fond sidebar */
  --color-background-ia: #3a3a3a; /* Fond messages IA */
  --color-on-black: #ffffff; /* Texte sur fond sombre */
  --color-on-white: #000000; /* Texte sur fond clair */
  --button: #4a4a4a; /* Couleur des boutons */
}
```

### 8.2 Changer le nom de l'application

Dans `App.svelte`, trouvez :

```svelte
<h1 class="website">Ochat</h1>
```

Et remplacez par le nom de votre choix.

---

## 📱 Étape 9 : Tester sur mobile (optionnel)

### 9.1 Trouver votre IP locale

**Windows :**

```bash
ipconfig
# Cherchez "IPv4 Address" (ex: 192.168.1.10)
```

**macOS / Linux :**

```bash
ifconfig | grep "inet "
# Cherchez votre IP locale (ex: 192.168.1.10)
```

### 9.2 Lancer Vite avec --host

```bash
npm run dev -- --host
```

### 9.3 Accéder depuis votre téléphone

1. Assurez-vous que votre téléphone est sur le **même réseau Wi-Fi**
2. Sur votre téléphone, ouvrez le navigateur
3. Allez sur : `http://VOTRE_IP:5173` (ex: http://192.168.1.10:5173)
4. Testez l'interface responsive !

---

## 🛠 Commandes utiles

### Développement

```bash
npm run dev          # Lancer en mode développement
npm run build        # Compiler pour la production
npm run preview      # Prévisualiser le build de production
```

### PocketBase

```bash
./pocketbase serve             # Lancer PocketBase
./pocketbase serve --http=0.0.0.0:8090  # Exposer sur le réseau local
```

### Git

```bash
git status                    # Voir l'état des modifications
git add .                     # Ajouter tous les fichiers
git commit -m "Mon message"   # Créer un commit
git push                      # Pousser vers GitHub
```

---

## 🔧 Dépannage

### Problème : Port 5173 déjà utilisé

**Solution :**

```bash
# Tuer le processus sur le port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID [numéro_pid] /F

# macOS / Linux
lsof -ti:5173 | xargs kill -9
```

### Problème : PocketBase ne démarre pas

**Solution :**

1. Vérifiez qu'aucun autre PocketBase n'est lancé
2. Supprimez le dossier `pb_data` et relancez (⚠️ supprime toutes les données)
3. Téléchargez à nouveau PocketBase

### Problème : Erreur "Module not found"

**Solution :**

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install
```

### Problème : Les messages ne s'enregistrent pas

**Solution :**

1. Vérifiez que PocketBase tourne
2. Vérifiez les collections dans l'admin PocketBase
3. Ouvrez la console du navigateur (F12) pour voir les erreurs

---

## 📞 Support

### En cas de problème

1. **Vérifiez les logs dans le terminal**
2. **Ouvrez la console du navigateur** (F12 > Console)
3. **Vérifiez l'interface admin PocketBase** (http://127.0.0.1:8090/_/)
4. **Consultez la documentation** :
   - [Svelte](https://svelte.dev/docs)
   - [PocketBase](https://pocketbase.io/docs/)
   - [Mistral AI](https://docs.mistral.ai/)

### Ressources utiles

- 📖 [Documentation Svelte](https://svelte.dev/tutorial)
- 📖 [Documentation PocketBase](https://pocketbase.io/docs/)
- 📖 [API Mistral AI](https://docs.mistral.ai/api/)
- 💬 [Discord Svelte](https://svelte.dev/chat)
