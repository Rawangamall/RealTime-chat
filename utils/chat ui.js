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
const limit = 7;
const conversationId = "6560146ffd9ffe0032d03fb0"
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiaWF0IjoxNzAwODYzODg4LCJleHAiOjE3MDE0Njg2ODh9.AvHxX1rKjE5ZoQYx-13SxnIqbbHlxns6MiWsq_ulAYc"
const loggedInUserId = 8;

function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const messageContent = messageInput.value.trim();
  socket.emit('sendMessage', {
    conversationId,
    sender: loggedInUserId,
    receiver: 1, // Replace with the recipient's ID
    content: messageContent
  });
  messageInput.value = ''; // Clear input field after sending message
}

// Event listener for receiving new messages in the room
socket.on('newMessage', (message) => {
  console.log([message], "Received new message");
  renderMessages([message], chatMessages, 1, loggedInUserId);

});

// Join the user to the conversation room when connected
socket.on('connect', () => {
  socket.emit('joinRoom', conversationId);
});

// Fetch messages for the conversation
async function fetchMessages(conversationId, limit, token) {
  try {
    const response = await axios.get(`http://localhost:8080/Conversation/${conversationId}?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const messages = response.data[0].messages;
    return messages;
  } catch (error) {
    console.log('Error fetching messages:', error);
    return [];
  }
}

// Function to render messages
function renderMessages(messages, chatMessages, limit, loggedInUserId) {
  messages.slice(0, limit).reverse().forEach(message => {
    console.log(message,"in render msg")
    const messageDiv = document.createElement('div');
    const senderName = message.sender.firstName || 'Me'; // Fallback if firstName is undefined
    const content = message.content || 'No content'; // Fallback if content is undefined

    messageDiv.textContent = `${senderName}: ${content}`;
        if (message.sender._id === loggedInUserId) {
      messageDiv.classList.add('sent-message');
    }
    chatMessages.appendChild(messageDiv);
  });
}

// Fetch and render initial messages
fetchMessages(conversationId, limit, token)
  .then(messages => {
    renderMessages(messages, chatMessages, limit, loggedInUserId);
  });

// Handling scrolling for fetching older messages
chatContainer.addEventListener('scroll', async () => {
  if (chatContainer.scrollTop === 0) {
    console.log("Scrolled up");
    const additionalMessages = await fetchAdditionalMessages();
    if (additionalMessages.length > 0) {
      renderMessages(additionalMessages, chatMessages, limit, loggedInUserId);
      chatContainer.scrollTop = additionalMessages.length * 50;
    }
  }
});

let offset = 0;

async function fetchAdditionalMessages() {
  try {
    const response = await axios.get(`http://localhost:8080/Conversation/${conversationId}?offset=${offset}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const additionalMessages = response.data[0].messages;
    offset += limit;
    return additionalMessages;
  } catch (error) {
    console.log('Error fetching additional messages:', error);
    return [];
  }
};