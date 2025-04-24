document.addEventListener("DOMContentLoaded", () => {
    initChat();
  });

  
  
  function initChat() {
    const API_BASE = "http://localhost:5000/api/chat";
    const token = localStorage.getItem("token");
  
    if (!token) {
      alert("You are not logged in.");
      return;
    }
  
    const chatListEl = document.getElementById("chatList");
    const searchInput = document.getElementById("searchInput");
    const chatContent = document.getElementById("chatContent");
    const newChatBtn = document.getElementById("newChatBtn");
    const sendMessageBtn = document.getElementById("sendMessageBtn");
    const messageInput = document.getElementById("messageInput");
    const chatInputContainer = document.getElementById("chatInputContainer");
  
    let allSessions = [];
    let activeSessionId = null;
    let isCreatingNewChat = false;
  
    function authHeaders() {
      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      };
    }
  
    async function loadSessions() {
      try {
        const res = await fetch(`${API_BASE}/sessions`, {
          headers: authHeaders()
        });
  
        if (!res.ok) throw new Error("Unauthorized or failed to fetch");
  
        allSessions = await res.json();
        renderChatList(allSessions);
      } catch (err) {
        console.error("Session load error:", err.message);
        chatListEl.innerHTML = `<div class="chat-item">Failed to load chat sessions.</div>`;
      }
    }
  
    function renderChatList(sessions) {
      chatListEl.innerHTML = "";
      sessions.forEach(session => {
        const div = document.createElement("div");
        div.className = "chat-item" + (activeSessionId === session._id ? " active" : "");
        div.innerHTML =
          '<div style="display: flex; justify-content: space-between; align-items: center;">' +
          `<div onclick="handleSelect('${session._id}')" style="cursor:pointer;">` +
          `<strong>${session.title}</strong><br/><small>Click to view</small>` +
          '</div>' +
          `<div>
            <button onclick="renameSession('${session._id}')" title="Rename">✏️</button>
            <button onclick="deleteSession('${session._id}')" title="Delete">🗑️</button>
          </div>` +
          '</div>';
        chatListEl.appendChild(div);
      });
    }
  
    window.handleSelect = async function (sessionId) {
      activeSessionId = sessionId;
      chatInputContainer.style.display = "flex";
      renderChatList(filterSessions(searchInput.value));
      await loadMessages(sessionId);
    };
  
    function filterSessions(query) {
      return allSessions.filter(session =>
        session.title.toLowerCase().includes(query.toLowerCase())
      );
    }
  
    async function loadMessages(sessionId) {
      try {
        const res = await fetch(`${API_BASE}/messages/${sessionId}`, {
          headers: authHeaders()
        });
  
        const messages = await res.json();
        renderMessages(messages);
      } catch (err) {
        chatContent.innerHTML = `<p>⚠️ Failed to load messages.</p>`;
      }
    }
  
    function renderMessages(messages) {
      chatContent.innerHTML = messages
        .map(msg => `<div><b>${msg.sender?.username || 'User'}:</b> ${msg.message}</div>`)
        .join("<hr/>");
    }
  
    newChatBtn.addEventListener("click", () => {
      isCreatingNewChat = true;
      chatInputContainer.style.display = "flex";
      chatContent.innerHTML = `<i>New chat started. Type your first message below and press Send.</i>`;
    });
  
    sendMessageBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    });
  
    async function sendMessage() {
      const message = messageInput.value.trim();
      if (!message) return;
  
      try {
        let response;
        if (isCreatingNewChat || !activeSessionId) {
          response = await fetch(`${API_BASE}`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ message })
          });
        } else {
          response = await fetch(`${API_BASE}`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ message, sessionId: activeSessionId })
          });
        }
  
        const data = await response.json();
        if (response.ok) {
          if (isCreatingNewChat) {
            activeSessionId = data.sessionId;
            isCreatingNewChat = false;
            await loadSessions();
          }
          messageInput.value = "";
          await loadMessages(activeSessionId);
        } else {
          alert(data.message || "Failed to send");
        }
      } catch (err) {
        console.error(err);
        alert("Error sending message");
      }
    }
  
    window.renameSession = async (sessionId) => {
      const title = prompt("Enter new title:");
      if (!title) return;
  
      const res = await fetch(`${API_BASE}/rename/${sessionId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ title })
      });
  
      if (res.ok) loadSessions();
    };
  
    window.deleteSession = async (sessionId) => {
      const confirmDelete = confirm("Delete this chat session?");
      if (!confirmDelete) return;
  
      const res = await fetch(`${API_BASE}/${sessionId}`, {
        method: "DELETE",
        headers: authHeaders()
      });
  
      if (res.ok) {
        if (sessionId === activeSessionId) {
          activeSessionId = null;
          chatContent.innerHTML = "Select a chat from the sidebar.";
          chatInputContainer.style.display = "none";
        }
        loadSessions();
      }
    };
  
    searchInput.addEventListener("input", () => {
      renderChatList(filterSessions(searchInput.value));
    });
  
    chatInputContainer.style.display = "none"; // Initially hide input
    loadSessions();
  }
  