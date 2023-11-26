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

//static data to test only later dynamic in real clientside
const limit = 6;
const conversationId = 1
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiaWF0IjoxNzAwODYzODg4LCJleHAiOjE3MDE0Njg2ODh9.AvHxX1rKjE5ZoQYx-13SxnIqbbHlxns6MiWsq_ulAYc"
const loggedInUserId = 8;
let LastMsgID = 1;
let totalMessageCount = 0;

// Connect to the Socket.IO server
const socket = io('http://localhost:8080', {
  extraHeaders: {
    Authorization: `Bearer ${token}`
  }
});

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
  console.log("in newMessage");
  try {
    const response = await axios.get(`http://localhost:8080/user/name/${message.sender}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Response data:', response.data); // Log the response data for debugging
    // Update UI with the received message data
  } catch (error) {
    console.error('Error fetching user name:', error);
  }
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

    const olderMessages = await fetchPreviousMessages(conversationId, limit, token, LastMsgID);
    if (olderMessages.length > 0) {

      renderMessages(olderMessages, chatMessages, loggedInUserId, true);         
      LastMsgID = olderMessages[olderMessages.length - 1]._id    // to fetch the earlist msg of that one

        }
  }
});

async function fetchLatestMessages(conversationId, limit, token) {
  try {
    const response = await axios.get(`http://localhost:8080/OneConversation/${conversationId}?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const latestMessages = response.data[0].messages;
    console.log(latestMessages[latestMessages.length-1]._id,'lastMessageID');
    LastMsgID = latestMessages[latestMessages.length-1]._id
    return latestMessages.reverse();
  } catch (error) {
    console.log('Error fetching latest messages:', error);
    return [];
  }
}

async function fetchPreviousMessages(conversationId, limit, token,LastMsgID) {
  try {

     const response = await axios.get(`http://localhost:8080/OneConversation/${conversationId}?lastID=${LastMsgID}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  
    console.log(response.data[0].messages,"response.data[0].messages ")

    const previousMessages = response.data[0].messages;
    return previousMessages;
  } catch (error) {
    console.log('Error fetching previous messages:', error);
    return [];
  }
}

function renderMessages(messages, chatMessages, loggedInUserId, prepend = false) {
  messages.forEach(message => {
    const messageDiv = document.createElement('div');
    const senderName = message.sender.firstName || message.senderName; 
    const content = message.content || 'No content';
    messageDiv.textContent = `${senderName}: ${content}`;

    if (!prepend) {
      console.log('Appending new message:', message);

      chatMessages.appendChild(messageDiv); 
    } else {
      console.log('insert new message:', message , prepend);

      chatMessages.insertBefore(messageDiv, chatMessages.firstChild); 
    }
  });
}


// Function to display a notification
function displayNotification(message) {
  const notificationContainer = document.querySelector('.notification-container');

  // Create notification element
  const notification = document.createElement('div');
  notification.classList.add('notification');
  notification.textContent = message;

  // Add the notification to the container
  notificationContainer.appendChild(notification);

}