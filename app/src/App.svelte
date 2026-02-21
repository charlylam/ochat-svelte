<script>
  /* ================================
     IMPORTS
     ================================ */

  import { onMount } from "svelte";
  import Markdown from "svelte-exmarkdown";

  /* ================================
     VARIABLES D'ÉTAT PRINCIPALES
     ================================ */

  let sidebarOpen = $state(false);
  let userName = $state("");
  let userToken = $state(""); // Le token que l'utilisateur va saisir
  let isAuthenticated = $state(false); // Est-ce que l'utilisateur est connecté ?
  let authError = $state(""); // message d'erreur affiché à l'écran
  let userMessage = $state("");
  let chatContent = $state([]);
  let newConversation = $state("");
  let conversationCollection = $state([]);
  let currentConversationId = $state(null); // ID de la conversation active

  /* ================================
     INITIALISATION AU CHARGEMENT
     ================================ */

  onMount(async () => {
    const savedToken = localStorage.getItem("mistralApiKey"); // Récupère la clé API stockée localement (si elle existe)
    const savedUserName = localStorage.getItem("userName");

    if (savedToken) {
      userToken = savedToken;
    }

    if (savedUserName) {
      userName = savedUserName;
    }

    //Charger les conversations
    const conv = await getConversations();
    conversationCollection = conv;
  });

  /* ================================
     CONNEXION UTILISATEUR
     ================================ */

  async function sendKey(event) {
    event.preventDefault();
    authError = "";

    // Vérifie que la clé n'est pas vide
    if (!userToken || userToken.trim() === "") {
      authError = "Veuillez saisir une clé API.";
      return;
    }

    // Vérifie que le nom n'est pas vide
    if (!userName || userName.trim() === "") {
      authError = "Veuillez saisir un nom d'utilisateur";
      return;
    }

    try {
      // Test de la clé API avec une requête
      const response = await fetch(
        "https://api.mistral.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            model: "mistral-small-latest",
            messages: [{ role: "user", content: "test" }],
          }),
        }
      );

      //Clé invalide ou refusée
      if (!response.ok) {
        authError = "Clé API invalide ou inexistante.";
        return;
      }

      // Clé valide, stocke la clé API et le nom dans le localStorage
      localStorage.setItem("mistralApiKey", userToken);
      localStorage.setItem("userName", userName);
      isAuthenticated = true;
    } catch (error) {
      authError = "Impossible de contacter le serveur Mistral.";
    }
  }

  /* ================================
   DÉCONNEXION UTILISATEUR
   ================================ */

  function logout() {
    // Supprime les données stockées
    localStorage.removeItem("mistralApiKey");
    localStorage.removeItem("userName");

    // Réinitialise les variables
    userToken = "";
    userName = "";
    isAuthenticated = false;
    chatContent = []; // Vide le chat local (pas pocketbase)
  }

  /* ================================
     POCKETBASE - CREATION DU RECORD
     ================================ */

  async function createRecord(collection, data) {
    try {
      const response = await fetch(
        `http://127.0.0.1:8090/api/collections/${collection}/records`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data), // Convertit l'objet en JSON
        }
      );

      // Vérifie si la requête a échoué
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur création record"
        ); /*Envoi une nouvelle erreur au catch, soit celle de pocketbase soit celle le message par défaut*/
      }

      // Retourne le record créé
      return await response.json();
    } catch (err) {
      console.error("Erreur createRecord:", err);
      return null;
    }
  }

  /* ================================
     POCKETBASE - RÉCUPÉRATION DES MESSAGES
     ================================ */

  async function getMessages(conversationId) {
    try {
      //filtre les messages par id de conversations
      // sort=time trie les messages par date croissante (du plus ancien au plus récent)
      const response = await fetch(
        `http://127.0.0.1:8090/api/collections/stockage_messages/records?filter=(conversation_id='${conversationId}')&sort=created`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Vérifie si la requête a échoué
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des messages");
      }

      const data = await response.json();

      // PocketBase retourne les records dans la propriété "items"
      return data.items;
    } catch (err) {
      console.error("Erreur getMessages:", err);
      return []; // Retourne un tableau vide en cas d'erreur
    }
  }

  /* ================================
     CREER UNE NOUVELLE CONVERSATION
     ================================ */

  async function addConversation(event) {
    event.preventDefault();
    if (!newConversation) return;

    // Crée la conversation dans PocketBase
    // On appelle createRecord précédemment créée avec en paramètre le nom de la collection PB
    // et {les données à enregistrer}
    const conversation = await createRecord("conversations", {
      title: newConversation.trim(),
    });

    if (!conversation) {
      alert("Impossible de créer la conversation");
      return;
    }

    //Copie tous les éléments de l'ancien tableau et ajoute la nouvelle conversation à la fin
    conversationCollection = [...conversationCollection, conversation];

    // Sélectionne automatiquement la nouvelle conversation
    await selectConversation(conversation.id);

    // Sélectionne automatiquement cette nouvelle conversation
    currentConversationId = conversation.id;

    // Vide le chat (nouvelle conversation = nouveau départ)
    chatContent = [];

    // Vide le champ de saisie
    newConversation = "";
  }

  /* ================================
   RÉCUPÉRATION DES CONVERSATIONS
   ================================ */

  async function getConversations() {
    try {
      const response = await fetch(
        `http://127.0.0.1:8090/api/collections/conversations/records?sort=-created`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Erreur API PocketBase:", data);
        return []; //retourne un tableau vide pour éviter les erreurs
      }

      if (!data.items) {
        console.warn("Pas de propriété 'items' dans la réponse");
        return [];
      }

      return data.items;
    } catch (err) {
      console.error("Erreur getConversations:", err);
      return [];
    }
  }

  /* ================================
   SÉLECTIONNER UNE CONVERSATION
   ================================ */

  async function selectConversation(conversationId) {
    // Change la conversation active
    currentConversationId = conversationId;

    // Charge les messages de cette conversation
    const messages = await getMessages(conversationId);

    if (messages && messages.length > 0) {
      chatContent = messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        time: new Date(msg.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        created: msg.time,
        
      }));
    } else {
      // Si aucun message, vide le chat
      chatContent = [];
    }
    sidebarOpen = false;
  }

  /* ================================
 SUPPRIMER UNE CONVERSATION
 ================================ */

  async function deleteConversation(conversationId) {
    try {
      const response = await fetch(
        `http://127.0.0.1:8090/api/collections/conversations/records/${conversationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        alert("Impossible de supprimer la conversation");
        return;
      }

      // Supprime la conversation de la liste locale
      conversationCollection = conversationCollection.filter(
        (conv) => conv.id !== conversationId
      );

      // Si c'était la conversation active, vide le chat
      if (currentConversationId === conversationId) {
        currentConversationId = null;
        chatContent = [];
      }
    } catch (err) {
      console.error("Erreur deleteConversation:", err);
      alert("Erreur lors de la suppression");
    }
  }

/* ================================
 ACTIVER/DÉSACTIVER L'ÉDITION D'UNE CONVERSATION
 ================================ */

function toggleEdit(conversationId) {
  conversationCollection = conversationCollection.map(conv => {
    if (conv.id === conversationId) {
      // Si on active l'édition, on sauvegarde le titre actuel
      if (!conv.isEditing) {
        conv.editingTitle = conv.title;
      }
      return { ...conv, isEditing: !conv.isEditing };
    }
    return conv;
  });
}

/* ================================
 MODIFIER UNE CONVERSATION
 ================================ */

async function modifyConversation(conversationId, newTitle) {
  // Vérifie que le nouveau titre n'est pas vide
  if (!newTitle || newTitle.trim() === "") {
    alert("Le titre ne peut pas être vide");
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:8090/api/collections/conversations/records/${conversationId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      }
    );

    if (!response.ok) {
      alert("Impossible de modifier le titre de la conversation");
      return;
    }

    const updatedConversation = await response.json();

    // Met à jour la liste locale avec le nouveau titre
    conversationCollection = conversationCollection.map(conv => {
      if (conv.id === conversationId) {
        return { 
          ...conv, 
          title: updatedConversation.title,
          isEditing: false, // Désactive le mode édition
          editingTitle: undefined // Nettoie le titre temporaire
        };
      }
      return conv;
    });

    console.log("✅ Conversation modifiée avec succès");
  } catch (err) {
    console.error("Erreur modifyConversation:", err);
    alert("Erreur lors de la modification");
  }
}

/* ================================
 ANNULER L'ÉDITION
 ================================ */

function cancelEdit(conversationId) {
  conversationCollection = conversationCollection.map(conv => {
    if (conv.id === conversationId) {
      return { 
        ...conv, 
        isEditing: false,
        editingTitle: undefined
      };
    }
    return conv;
  });
}

  /* ================================
     ENVOI D'UN MESSAGE DE L'UTILISATEUR
     ================================ */

  async function sendMessage(event) {
    event.preventDefault();

    if (!currentConversationId) {
      alert("Veuillez d'abord sélectionner ou créer une conversation");
      return;
    }

    // Ne fait rien si le message est vide
    if (!userMessage) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit", // Récupère l'heure du message
    });

    const currentMessage = userMessage; // Sauvegarde le message actuel

    // Ajoute le message utilisateur à l'historique
    chatContent.push({
      id: Date.now(),
      role: "user",
      content: currentMessage,
      time,
      created: now.toISOString(), // stocke la date complète pour affichage
    });

    userMessage = "";

    /* ================================
       STOCKER DANS POCKETBASE
       ================================ */

    const userRecord = await createRecord("stockage_messages", {
      content: currentMessage,
      role: "user",
      time: new Date().toISOString(),
      conversation_id: currentConversationId, // Lier à la conversation
    });

    if (!userRecord) {
      chatContent.push({
        id: Date.now(),
        role: "assistant",
        content: "Impossible d'enregistrer le message dans PocketBase",
        created: new Date().toISOString(),
      });
      return; //retour si message pas sauvegardé
    }

    /* ================================
       APPEL À L'API MISTRAL
       ================================ */

    /*Try catch permet de tester un bloc de code et de gérer l'erreur*/
    try {
      const response = await fetch(
        "https://api.mistral.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`, //Authentification
          },
          body: JSON.stringify({
            model: "mistral-large-latest",
            messages: chatContent.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      const data = await response.json();

      //Vérification d'erreur dans la réponse
      if (data.error) {
        console.error("Erreur API:", data.error);

        chatContent.push({
          id: Date.now(),
          role: "assistant",
          content: `Erreur ${response.status}: ${data.message || "Erreur API"}`,
          created: new Date().toISOString(),
        });
        return;
      }

      // Récupère la réponse de l'IA
      const iaResponse = data.choices[0].message.content;
      const iaTime = new Date();

      //Ajout réponse de l'IA à l'historique
      chatContent.push({
        id: Date.now(),
        role: "assistant",
        content: iaResponse,
        time: iaTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        created: iaTime.toISOString(),
      });

      /* ================================
       AJOUT REPONSE IA POCKETBASE
       ================================ */

      const iaRecord = await createRecord("stockage_messages", {
        content: iaResponse,
        role: "assistant",
        time: iaTime.toISOString(),
        conversation_id: currentConversationId,
      });
    } catch (error) {
      // Erreur réseau ou technique
      console.error("Erreur API Mistral :", error);

      chatContent.push({
        id: Date.now(),
        role: "assistant",
        content: "Erreur lors de la communication avec l'IA.",
        created: new Date().toISOString(),
      });
    }
  }

  /* ================================
     GESTION DE LA TOUCHE ENTRÉE
     ================================ */

  function handleKeyPress(event) {
    // Si l'utilisateur appuie sur Entrée SANS Shift
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(event);
    }
  }
</script>

<!------------------------------- STRUCTURE HTML -------------------------------->

<!-------------------------------
  CONTENEUR PRINCIPAL
  Englobe toute l'application
-------------------------------->

<div class="container">
  {#if !isAuthenticated}
    <!--------------------------------
      ÉCRAN DE CONNEXION
      Affiché si l'utilisateur
      n'est pas authentifié
    --------------------------------->

    <div class="login__screen">
      <div class="login__box">
        <h2>Connexion Ochat</h2>
        {#if authError}
          <p class="auth__error">{authError}</p>
        {/if}

        <!-- Formulaire de connexion -->
        <form onsubmit={sendKey} class="login_form">
          <!-- Champ nom d'utilisateur -->
          <input
            bind:value={userName}
            class="username__input"
            type="text"
            placeholder="Votre nom d'utilisateur"
            aria-label="Saisir le nom d'utilisateur"
            required
          />
          <!-- Champ clé API  -->
          <input
            bind:value={userToken}
            class="key__input"
            type="password"
            placeholder="Votre clé API"
            aria-label="Saisir clé API"
            required
          />
          <!-- Bouton de validation -->
          <button class="key__button" type="submit">ok</button>
        </form>
      </div>
    </div>
  {:else}
    <!--------------------------------
      HEADER
      Logo / nom de l'application
    --------------------------------->

    <header>
      <h1 class="website" onclick={() => (sidebarOpen = !sidebarOpen)}>
        Ochat
      </h1>
      <button onclick={logout} class="logout__button">Déconnexion</button>
    </header>

    <main>
      <!-----------------------------
        SIDEBAR — CONVERSATIONS
      ------------------------------>

      <aside 
  id="sidebar-nav"
  class="aside__nav {sidebarOpen ? 'active' : ''}"
  aria-label="Navigation des conversations"
  aria-hidden={!sidebarOpen}
>
        <nav class="chat__history">
          <h2 class="chat__names">Conversations</h2>

          <!-- Liste des conversations existantes -->

          <div class="chats__button" >
            <ul class="button__list">
  {#each conversationCollection as conversation (conversation.id)}
    <li class="chat__item" class:selected__chat={currentConversationId === conversation.id}>
      {#if conversation.isEditing}

        <!-- Mode édition : affiche un input -->

        <input
          type="text"
          class="edit__input"
          bind:value={conversation.editingTitle}
          placeholder="Nouveau titre"
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              modifyConversation(conversation.id, conversation.editingTitle);
            } else if (e.key === 'Escape') {
              cancelEdit(conversation.id);
            }
          }}
        />
        <button
          class="validate__button"
          type="button"
          onclick={() => modifyConversation(conversation.id, conversation.editingTitle)}
          aria-label="Valider">✓</button>
        <button
          class="cancel__button"
          type="button"
          onclick={() => cancelEdit(conversation.id)}
          aria-label="Annuler">✕</button>
      {:else}

        <!-- Mode normal : affiche le bouton -->
         
        <button
          class="chat__subject"
          
          type="button"
          onclick={() => selectConversation(conversation.id)}
          aria-label="Ouvrir la conversation {conversation.title}"
          >{conversation.title}</button>
        
        <button
          class="modify__button"
          type="button"
          onclick={() => toggleEdit(conversation.id)}
          aria-label="Modifier la conversation {conversation.title}">🖉</button>
        
        <button
          class="delete__button"
          type="button"
          onclick={() => deleteConversation(conversation.id)}
          aria-label="Supprimer la conversation {conversation.title}">X</button>
      {/if}
    </li>
  {/each}
</ul>
          </div>

          <!-- Footer de la sidebar avec formulaire de création -->
          <footer class="aside__footer">
            <div class="new__subject">
              <form class="new__chat" onsubmit={addConversation}>
                <label for="new__chat__input" class="form__label"></label>
                <input
                  bind:value={newConversation}
                  id="new__chat__input"
                  class="new__chatInput"
                  type="text"
                  placeholder="Nouvelle conversation"
                  aria-required="true"
                  spellcheck="false"
                />
                <button class="create__subject" type="submit">Créer</button>
              </form>
            </div>
          </footer>
        </nav>
      </aside>

      <!-----------------------------
        ZONE CHAT PRINCIPALE
      ------------------------------>

      <div class="main__content">
        <section class="chat" aria-label="Conversation actuelle">
          <h2 class="main__chat">
            {conversationCollection.find((c) => c.id === currentConversationId)
              ?.title || "Sélectionnez une conversation"}
          </h2>

          {#each chatContent as message (message.id)}
            {#if message.role === "user"}
              <!-- Message utilisateur -->
              <div class="user__message">
                <article class="user__chat">
                  <p class="user__content">
                    <span
                      class={message.role === "user" ? "user-name" : "ia-name"}
                    >
                      {message.role === "user" ? userName : "Ochat"}
                    </span>: {message.content}
                  </p>
                  <time class="time">
                    {new Date(message.created).toLocaleString([], {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</time
                  >
                </article>
              </div>
            {:else}
              <!-- Message IA -->
              <div class="ia__message">
                <article class="ia__chat">
                  <p class="user__content">
                    <span
                      class={message.role === "user" ? "user-name" : "ia-name"}
                    >
                      {message.role === "user" ? userName : "Ochat"}
                    </span>: <Markdown md={message.content} />
                  </p>
                </article>
              </div>
            {/if}
          {/each}
        </section>

        <!-----------------------------
          FOOTER — SAISIE MESSAGE
        ------------------------------>

        <footer class="request">
          <form class="request__form" onsubmit={sendMessage}>
            <label for="new__message" class="newMessage__label"></label>
            <textarea
              bind:value={userMessage}
              id="new__message"
              class="input__textarea"
              placeholder="Écris ton message"
              aria-label="Saisir votre message"
              onkeydown={handleKeyPress}
              spellcheck="false"
            ></textarea>
            <button class="submit__message" type="submit" aria-label="Envoyer le message">➤</button>
          </form>
        </footer>
      </div>
    </main>
  {/if}
</div>

<!------------------------------- CSS -------------------------------->

<style>
  /* ================================
   CONTENEUR PRINCIPAL
   ================================ */

  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    background-color: var(--color-background-chat);
    color: var(--color-on-black);
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  }

  /* ================================
   ÉCRAN DE CONNEXION
   ================================ */

  .login__screen {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  /* Carte blanche centrale */
  .login__box {
    background-color: var(--color-background-conversations);
    padding: 3rem;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    text-align: center;
    max-width: 400px;
    width: 90%;
  }

  .login__box h2 {
    color: white;
    margin: 0 0 1rem 0;
  }

  .login__box p {
    color: white;
    margin-bottom: 2rem;
  }

  /* Formulaire vertical */
  .login_form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    
  }

  /* Champs input */
  .key__input,
  .username__input {
    padding: 1rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    background-color: white;
    color: var(--color-on-white)
  }

  .key__input:focus,
  .username__input:focus {
    outline: none;
    border-color: #666;
  }

  /* Bouton validation */
  .key__button {
    padding: 1rem;
    background-color: var(--button);
    color: white;
    border: transparent 1px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: 0.300s;
  }

  .key__button:hover {
    scale: calc(1.05);
  }

  .auth__error {
    background-color: #584f4f;
    font-weight: bold;
    border: solid 1px white;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

/*Forcer le background via CSS pour les champs autofill*/

  input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0px 1000px var(--color-on-black) inset;
  -webkit-text-fill-color: var(--color-on-white);
  transition: background-color 5000s ease-in-out 0s;
}


  /* ================================
   HEADER
   ================================ */

  header {
    position: absolute; /*le header sort du flux pour être positionné comme un logo*/
    top: 1rem;
    right: 2rem;
    z-index: 20;
  }

  .website {
    font-size: 1.3rem;
    margin: 0;
  }

  .logout__button {
    position: absolute;
    right: 0rem;
    margin-top: 10px;
    padding: 0 0.5rem 0 0.5rem;
    font-size: 15px;
    border-radius: 3px;
    color: var(--color-on-black);
    background-color: var(--button);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border: none;
    transition: all 0.3s ease;

      &:hover {
      transform: scale(1.05);
    }
  }

  /* ================================
   MAIN LAYOUT
   ================================ */

  main {
    flex: 1;
    display: flex;
    overflow: hidden; /*permet de tout mettre au même niveau en cachant ce qui dépasse*/
  }

  /* ================================
   SIDEBAR
   ================================ */

  .aside__nav {
    width: 250px;
    flex-shrink: 0; /*empêche le rétrécissement du conteneur*/
    padding: 1rem;
    background-color: var(--color-background-conversations);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
    z-index: 5; /*permet à l'effet d'ombre d'être au dessus*/
    border-right: solid 1px #303030;
  }

  .chat__history {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  h2 {
    color: var(--color-on-black);
    text-align: center;
    margin-top: 2rem;
    font-weight: 500;
    font-size: 1.7rem;
    font-weight: bold;
  }

  /* Liste scrollable */
  .chats__button {
    flex: 1;
    overflow-y: auto;
    padding: 0 0.4rem;
  }

  .button__list {
    list-style: none; /*supprime la puce de la liste*/
    padding: 0;
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Une conversation */
  .chat__item {
    display: flex;
    align-items: center;
    background-color: var(--color-background-ia);
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border: solid 1px transparent;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--color-background-chat);
      transform: scale(1.05);
    }
  }

  .chat__subject {
    flex: 1;
    padding: 0.5rem 0.8rem;
    background-color: transparent;
    color: var(--color-on-black);
    text-align: center;
    cursor: pointer;
    font-size: 0.9rem;
    border: none;
  }

  .chat__subject.selected__chat {
    background-color: var(--color-background-chat);
    font-weight: bold;
  }

  .chat__item.selected__chat {
    background-color: var(--color-background-chat);
    font-weight: bold;
  }

  .delete__button {
    padding: 0;
    margin-right: 0.5rem;
    width: 25px;
    height: 25px;
    background-color: #4d4949;
    color: var(--color-on-black);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border: 1px solid var(--color-background-conversations);
    transition: all 0.3s ease;

    &:hover {
      border: solid 1px #fff;
      background-color: #3a3737;
    }
  }

    .modify__button {
    padding: 0;
    margin-right: 0.5rem;
    width: 25px;
    height: 25px;
    background-color: #4d4949;
    color: var(--color-on-black);
    cursor: pointer;
    border: 1px solid var(--color-background-conversations);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;

    &:hover {
      border: solid 1px #fff;
      background-color: #3a3737;
    }
    }

    .edit__input {
      border: none;
      border-radius: 6px;
      padding: 6px;
      margin: 6px;
  }

  .validate__button {
   padding: 0;
    margin-right: 0.5rem;
    width: 25px;
    height: 25px;
    background-color: #4d4949;
    color: var(--color-on-black);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border: 1px solid var(--color-background-conversations);
    transition: all 0.3s ease;

    &:hover {
      border: solid 1px #fff;
      background-color: #3a3737;
    }
  }

  .cancel__button {
     padding: 0;
    margin-right: 0.5rem;
    width: 25px;
    height: 25px;
    background-color: #4d4949;
    color: var(--color-on-black);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border: 1px solid var(--color-background-conversations);
    transition: all 0.3s ease;

    &:hover {
      border: solid 1px #fff;
      background-color: #3a3737;
    }
  }

  .aside__footer {
    margin-top: auto; /*pousse l'élément vers le bas du conteneur flex*/
    flex-shrink: 0;
  }

  .new__chat {
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .new__chatInput {
    background-color: var(--color-on-black);
    padding: 0.6rem;
    border: none;
    border-radius: 6px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.25);
    outline: none;
    color: var(--color-on-white)


  }

  .create__subject {
    background-color: var(--button);
    color: var(--color-on-black);
    padding: 0.5rem;
    margin: 0.5rem 0;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    &:hover {
      transform: scale(1.05);
    }
  }

  /* ================================
   ZONE CHAT
   ================================ */

  .main__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }

  .chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto; /*ajoute une barre de scroll si le contenu dépasse le conteneur*/
  }

  .main__chat {
    position: sticky;
    top: 0;
    background-color: var(--color-background-chat);
    padding: 0.5rem;
    z-index: 10; /* au-dessus des messages */
    border-bottom: 1px solid #444;
  }

  /* Messages utilisateur */
  .user__message {
    position: relative;
    background-color: var(--color-background-conversations);
    border-radius: 6px;
    padding: 0.5rem 2rem;
    margin: 1.5rem 10rem 1.5rem 10rem;
    text-align: start;
  }

    .time {
    position: absolute;
    bottom: -1.5rem;
    right: 0;
  }

  .user-name {
    font-weight: bold;
  }

  /* Messages IA */
  .ia__message {
    background-color: var(--color-background-ia);
    border-radius: 6px;
    margin: 1.5rem 10rem 1.5rem 10rem;
    padding: 0.5rem 2rem;
    color: var(--color-on-black);
    text-align: start;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
  }

  .ia-name {
    font-weight: bold;
  }

  /* ================================
   SAISIE MESSAGE
   ================================ */

  .request {
    background-color: var(--color-background-conversations);
    border-radius: 6px;
    margin: 1.5rem 10rem 1.5rem 10rem;
    padding: 1rem;
    color: white;
  }

  .request__form {
    display: flex;
    justify-content: center;
  }

  /* Champ texte */
  .input__textarea {
    flex: 1; /*permet de prendre tout l'espace restant dans le conteur*/
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 6px;
    resize: none; /*supprime la possibilité de redimensionner la fenêtre*/
    font-family: inherit; /*supprime la font par défaut*/
    font-size: 0.95rem;
    height: 1.5rem; /* Hauteur minimale */
    max-height: 30px; /* Hauteur maximale avant scroll */
    overflow-y: auto; /* Scroll si dépasse max-height */
    line-height: 1.5;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.25);
    outline: none;
    background-color: var(--color-on-black);
    color: var(--color-on-white)
  }

  .submit__message {
    margin: 0 1rem 0 1rem;
    background-color: var(--button);
    transition: all 0.3s ease;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: bold;
    color: var(--color-on-black);

    &:hover {
      transform: scale(1.05);
    }
  }

  /* ================================
   RESPONSIVE MOBILE
   (768px format d'une tablette en mode portrait)
   ================================ */

  @media (max-width: 768px) {
    main {
      flex-direction: column;
    }

/* Ecran de connexion */

 .login__box {
    width: 70%;       /* prend presque toute la largeur */
    padding: 1.5rem;  /* padding réduit */
  }

  .login__box h2 {
    font-size: 1.5rem;  /* texte plus petit */
  }

  .login__box p {
    font-size: 0.9rem;
  }

  .login__box input,
  .login__box button {
    margin: auto;
    width: 80%;       /* prennent toute la largeur du container */
    font-size: 0.9rem; /* texte légèrement plus petit */
    padding: 0.8rem;
  }

    /* Sidebar masquée */
    .aside__nav {
      position: fixed; /*fixe l'élément par rapport à la fenêtre pas au parent, ne bouge pas lors d'un scroll*/
      top: 0;
      left: -100%;
      height: 100vh;
      width: 250px;
      z-index: 20; /*La sidebar apparaît au-dessus du chat mais derrière le header*/
      transition: left 0.3s ease;
    }

    .aside__nav.active {
      left: 0;
    }

    .chat__names {
      padding-top: 2rem;
    }

    .aside__footer {
      padding-bottom: 2rem;
    }

    /*HEADER*/
    header {
      position: fixed;
      top: 1rem;
      left: 1rem;
      z-index: 30;
    }

    .logout__button {
      position: absolute;
      right: 0rem;
      top: 0;
      margin-top: 10px;
      padding: 0 0.5rem 0 0.5rem;
      font-size: 12px;
      border-radius: 3px;
      color: var(--color-on-black);
      background-color: var(--button);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      border: none;
    }

    .website::after {
      /*crée un élément “virtuel” juste après le contenu réel de website. N’existe pas dans le HTML*/
      content: "☰";
      font-size: 1.5rem;
      margin-left: 1rem;
      cursor: pointer;
    }

    /* ESPACE CHAT : occupe toute la largeur */
    .main__content {
      flex: 1;
      width: 100%;
      padding: 0 0.5rem;
      margin-top: 3.5rem;
      box-sizing: border-box; /*La largeur inclut le padding*/
    }

    .user__message,
    .ia__message,
    .request {
      margin: 1rem 1rem;
      padding: 0.5rem 1rem;
    }

.input__textarea {
  flex: 1;
  min-height: 40px; /* un peu plus visible sur mobile */
   max-height: 100px;
  font-size: 14px;
}

.main__content { 
  display: flex; 
  flex-direction: column; 
  height: 100%;
}

.chat { 
  flex: 1; 
  overflow-y: auto; 
}

.request { 
  flex: none; 
  margin: 0 0.5rem 4.5rem .5rem;

}

  .submit__message {
      margin: 0 0.5rem;
      padding: 0.5rem;
    }
  }

</style>
