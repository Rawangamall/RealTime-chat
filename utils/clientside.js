//This page for just testing the realtime chat 
// Create elements and structure for the chat interface
const chatContainer = document.createElement('div');
chatContainer.classList.add('chat-container');

const messagesDiv = document.createElement('div');
messagesDiv.classList.add('messages');
messagesDiv.setAttribute('id', 'messages');

const inputField = document.createElement('input');
inputField.setAttribute('type', 'text');
inputField.setAttribute('id', 'messageInput');
inputField.setAttribute('placeholder', 'Type a message...');

const sendButton = document.createElement('button');
sendButton.innerText = 'Send';
sendButton.onclick = sendMessage;

chatContainer.appendChild(messagesDiv);
chatContainer.appendChild(inputField);
chatContainer.appendChild(sendButton);
document.body.appendChild(chatContainer);

const chatMessages = document.getElementById('messages');

// Connect to the Socket.IO server
const socket = io('http://localhost:8080');
const limit = 6;
const conversationId = "6560146ffd9ffe0032d03fb0"
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiaWF0IjoxNzAwODYzODg4LCJleHAiOjE3MDE0Njg2ODh9.AvHxX1rKjE5ZoQYx-13SxnIqbbHlxns6MiWsq_ulAYc"
const loggedInUserId = 8;
let offset = 1;

function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const messageContent = messageInput.value.trim();
  socket.emit('sendMessage', {
    conversationId,
    sender: loggedInUserId,
    receiver: 1, 
    content: messageContent
  });
  messageInput.value = ''; 
}

// Event listener for receiving new messages in the room
socket.on('newMessage', async (message) => {

  const response = await axios.get(`http://localhost:8080/user/name/${message.sender}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const senderName = response.data.firstName || 'Unknown'; // Fallback if firstName is undefined
  message.senderName = senderName;
  renderMessages([message], chatMessages, 1, loggedInUserId);

});

// Join the user to the conversation room when connected
socket.on('connect', () => {
  socket.emit('joinRoom', conversationId);
});
// Fetch and render initial latest messages
fetchLatestMessages(conversationId, limit, token)
  .then(messages => {
    renderMessages(messages, chatMessages, loggedInUserId);
  });

// Handling scrolling for fetching older messages
messagesDiv.addEventListener('scroll', async () => {
  if (messagesDiv.scrollTop === 0) {
    console.log('Scrolled up');
    const olderMessages = await fetchPreviousMessages(conversationId, limit, token, offset);
    if (olderMessages.length > 0) {
      renderMessages(olderMessages, chatMessages, loggedInUserId, true); // Append older messages
      offset++;
    }
  }
});

async function fetchLatestMessages(conversationId, limit, token) {
  try {
    const response = await axios.get(`http://localhost:8080/Conversation/${conversationId}?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const latestMessages = response.data[0].messages;
    return latestMessages;
  } catch (error) {
    console.log('Error fetching latest messages:', error);
    return [];
  }
}

async function fetchPreviousMessages(conversationId, limit, token,currentOffset) {
  try {
    const response = await axios.get(`http://localhost:8080/Conversation/${conversationId}?offset=${currentOffset}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const previousMessages = response.data[0].messages;
    return previousMessages;
  } catch (error) {
    console.log('Error fetching previous messages:', error);
    return [];
  }
}

function renderMessages(messages, chatMessages, loggedInUserId, prepend = false) {
  messages.reverse().forEach(message => {
    const messageDiv = document.createElement('div');
    const senderName = message.sender.firstName || message.senderName; 
    const content = message.content || 'No content';
    messageDiv.textContent = `${senderName}: ${content}`;

    if (prepend) {
      chatMessages.insertBefore(messageDiv, chatMessages.firstChild); // Prepend older messages
    } else {
      chatMessages.appendChild(messageDiv); // Append latest messages
    }
  });
}