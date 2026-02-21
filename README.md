🤖 # Ochat (Svelte)


Application de chat IA développée avec **Svelte 5**, utilisant :

- **Mistral AI API** (LLM)
- **PocketBase** (backend auto-hébergé)
- Gestion complète des conversations persistées en base

⚠️ Une clé API Mistral est requise pour utiliser l'application.

<a href="https://drive.google.com/file/d/1HV4fXuWBjfsoTUAb56tmhmVAZlpR1MiZ/view?usp=sharing">
  <img src="./video/O_Chat.gif" width="700" alt="Aperçu O'Chat">
</a>

🎥 [Voir la vidéo complète](https://vimeo.com/1160481966?share=copy&fl=sv&fe=ci)

Vous trouverez avec le projet :

- Une notice [NOTICE_OCHAT.md](https://github.com/charlylam/Portfolio/blob/main/projet-svelte/SA07-projet-ochat-charlylam/utilisation/NOTICE_OCHAT.md) afin de faire fonctionner le chat.
- Des captures d'écran du projet dans [FONCTIONNEMENT.md](https://github.com/charlylam/Portfolio/blob/main/projet-svelte/SA07-projet-ochat-charlylam/utilisation/FONCTIONNEMENT.md) (rendu responsive à la fin).


## 🚀 En 30 secondes

Ochat est une application de chat IA permettant :

- Authentification via clé API Mistral
- Création / modification / suppression de conversations
- Persistance des messages en base via PocketBase
- Gestion du contexte conversationnel
- Streaming des réponses IA
- Interface responsive mobile-first

---

## 🛠 Stack principale

- **Svelte 5 (runes)**
- **PocketBase**
- **Mistral AI API**
- LocalStorage
- Markdown
- CSS3 responsive

---

<details>
<summary><strong>📚 Objectifs pédagogiques & compétences mises en pratique</strong></summary>

### Frontend

- **Svelte 5** avec les runes
- Architecture orientée composants avec gestion d'état réactive
- Responsive design (mobile-first)
- Manipulation du DOM et gestion des événements
- LocalStorage pour la persistance des données d'authentification

### Backend & Base de données

- **PocketBase** comme backend auto-hébergé
- API REST (GET, POST, PATCH, DELETE)
- Gestion de collections et relations entre entités
- Stockage et récupération de données structurées

### Intégration IA

- Connexion à l'**API Mistral AI**
- Gestion de l'authentification par token
- Construction et envoi de contexte conversationnel
- Traitement des réponses en streaming

### Bonnes pratiques

- Séparation des préoccupations (logique / présentation)
- Gestion d'erreurs et feedback utilisateur
- Accessibilité (labels ARIA, navigation au clavier)
- Code commenté et documenté

</details>

---

<details>
<summary><strong>📁 Architecture du code & structure des données</strong></summary>

### Structure des données

**Collection `conversations`**

```javascript
{
  id: string,
  title: string,
  created: timestamp
}
```

**Collection stockage_messages**
```javascript
{
  id: string,
  content: string,
  role: "user" | "assistant",
  time: timestamp,
  conversation_id: string
}
```

| Fonction               | Rôle                                              |
| ---------------------- | ------------------------------------------------- |
| `sendKey()`            | Authentification utilisateur via API Mistral      |
| `createRecord()`       | Création générique d'enregistrements PocketBase   |
| `getMessages()`        | Récupération des messages d'une conversation      |
| `addConversation()`    | Création d'une nouvelle conversation              |
| `selectConversation()` | Chargement d'une conversation existante           |
| `modifyConversation()` | Modification du titre d'une conversation          |
| `deleteConversation()` | Suppression d'une conversation et de ses messages |
| `sendMessage()`        | Envoi d'un message et appel à l'API Mistral       |

</details>

---

<details> <summary><strong>⚙️ Installation & utilisation</strong></summary>
  
**Prérequis**

- Node.js (v16 ou supérieur)

- PocketBase installé et configuré

- Clé API Mistral AI

**1. Étapes d'installation**

- Cloner le projet

```bash
git clone [URL_DU_REPO]
cd ochat
```

**2. Installer les dépendances**

```bash
npm install
```
**3. Configurer PocketBase**

- Télécharger PocketBase depuis https://pocketbase.io

- Créer les collections conversations et stockage_messages

- Lancer PocketBase sur le port 8090

**4. Lancer l'application**

```bash
npm run dev
````

**5. Se connecter**

- Obtenir une clé API sur https://console.mistral.ai

- Entrer ses identifiants dans l'interface

</details>

---

<details> <summary><strong>📱 Responsive Design</strong></summary>

L'application est entièrement responsive avec :

- Breakpoint à 768px

- Menu hamburger sur mobile

- Adaptation des marges et espacements

- Optimisation de la zone de saisie tactile

</details>

---

<details> <summary><strong>🔐 Sécurité</strong></summary>

- Clé API stockée uniquement côté client (localStorage)

- Validation des entrées utilisateur

- Gestion des erreurs réseau et API

- Pas d'exposition de données sensibles

</details>

---

## 👨‍💻 Auteur

Projet réalisé par [Charly / Lamena] dans le cadre de la formation **Concepteur d'Applications Web augmenté par l'IA** chez O'clock.
