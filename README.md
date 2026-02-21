# 🤖 Ochat - Application de Chat IA

## 📋 Description du projet

Ochat est une application web de messagerie instantanée alimentée par l'intelligence artificielle Mistral AI. Développée dans le cadre de ma formation de Concepteur d'Applications Web augmenté par l'IA chez O'clock, cette application démontre ma maîtrise des technologies modernes du web et de l'intégration d'API d'intelligence artificielle.

L'application permet aux utilisateurs de créer plusieurs conversations, d'échanger avec une IA, et de conserver l'historique de leurs échanges de manière persistante.

<a href="https://drive.google.com/file/d/1HV4fXuWBjfsoTUAb56tmhmVAZlpR1MiZ/view?usp=sharing">
  <img src="./video/O_Chat.gif" width="700" alt="Aperçu O'Chat">
</a>

[Regarder la vidéo](https://vimeo.com/1160481966?share=copy&fl=sv&fe=ci)

_Note: Ce projet se concentrait uniquement sur le fichier App.svelte dans le dossier `app` >> `src`_

Vous trouverez avec le projet:

- Ce README décrivant l'ensemble du projet

Dans le dossier `utilisation`:

- Une notice [NOTICE_OCHAT.md](https://github.com/charlylam/Portfolio/blob/main/projet-svelte/SA07-projet-ochat-charlylam/utilisation/NOTICE_OCHAT.md) afin de faire fonctionner le chat.
- Des captures d'écran du projet dans [FONCTIONNEMENT.md](https://github.com/charlylam/Portfolio/blob/main/projet-svelte/SA07-projet-ochat-charlylam/utilisation/FONCTIONNEMENT.md) (rendu responsive à la fin).

## 🎯 Objectifs pédagogiques

Ce projet met en pratique les compétences suivantes :

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

## 🛠️ Technologies utilisées

| Technologie        | Usage                         |
| ------------------ | ----------------------------- |
| **Svelte 5**       | Framework JavaScript réactif  |
| **PocketBase**     | Backend-as-a-Service (BaaS)   |
| **Mistral AI API** | Modèle de langage large (LLM) |
| **Markdown**       | Formatage des réponses IA     |
| **CSS3**           | Styles et responsive design   |

## ⚙️ Fonctionnalités

### Authentification

- Connexion via clé API Mistral personnelle
- Validation de la clé en temps réel
- Stockage sécurisé dans le localStorage
- Gestion de session utilisateur

### Gestion des conversations

- ✅ Création de nouvelles conversations
- ✅ Sélection et affichage de conversations existantes
- ✅ Modification du titre d'une conversation
- ✅ Suppression de conversations
- ✅ Persistance complète en base de données

### Chat en temps réel

- Envoi de messages avec validation
- Affichage de l'historique complet
- Horodatage de chaque message
- Support du formatage Markdown pour les réponses IA
- Gestion du contexte conversationnel

### Interface utilisateur

- Design moderne et épuré
- Sidebar responsive avec menu burger sur mobile
- Affichage différencié utilisateur/IA
- Gestion des états de chargement et d'erreur
- Navigation au clavier (Enter pour envoyer, Shift+Enter pour saut de ligne)

## 📁 Architecture du code

### Structure des données

**Collection `conversations`**

```javascript
{
  id: string,
  title: string,
  created: timestamp
}
```

**Collection `stockage_messages`**

```javascript
{
  id: string,
  content: string,
  role: "user" | "assistant",
  time: timestamp,
  conversation_id: string (relation)
}
```

### Fonctions principales

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

## 🚀 Installation et utilisation

### Prérequis

- Node.js (v16 ou supérieur)
- PocketBase installé et configuré
- Clé API Mistral AI

### Étapes d'installation

1. **Cloner le projet**

```bash
git clone [URL_DU_REPO]
cd ochat
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer PocketBase**
   - Télécharger PocketBase depuis [pocketbase.io](https://pocketbase.io)
   - Créer les collections `conversations` et `stockage_messages`
   - Lancer PocketBase sur le port 8090

4. **Lancer l'application**

```bash
npm run dev
```

5. **Se connecter**
   - Obtenir une clé API sur [console.mistral.ai](https://console.mistral.ai)
   - Entrer ses identifiants dans l'interface de connexion

## 📱 Responsive Design

L'application est entièrement responsive avec :

- Breakpoint à 768px (tablette/mobile)
- Menu hamburger sur mobile
- Adaptation des marges et espacements
- Optimisation de la zone de saisie tactile

## 🔐 Sécurité

- Clé API stockée uniquement côté client (localStorage)
- Validation des entrées utilisateur
- Gestion des erreurs réseau et API
- Pas d'exposition de données sensibles

## 📈 Améliorations futures

- [ ] Authentification multi-utilisateurs avec gestion de profils
- [ ] Export de conversations en PDF/Markdown
- [ ] Support des fichiers et images
- [ ] Mode hors ligne avec synchronisation
- [ ] Thèmes personnalisables (light/dark mode)
- [ ] Recherche dans l'historique des conversations
- [ ] Création de composants

## 👨‍💻 Auteur

Projet réalisé par [Charly / Lamena] dans le cadre de la formation **Concepteur d'Applications Web augmenté par l'IA** chez O'clock.
