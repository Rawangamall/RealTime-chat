//simple page to test the realtime chat only 
// Constants
const API_URL = 'http://localhost:8080';
const NOTIFICATION_DURATION = 3000;

// Create elements and structure for the chat interface
// const chatContainer = document.createElement('div');
//chatContainer.classList.add('chat-container');

const chatContainer = document.getElementsByClassName('chat-container')[0]; 
const fileInput = document.getElementById('fileInput');
const sendFileButton = document.getElementById('sendFileButton');


const messagesDiv = document.createElement('div');
messagesDiv.classList.add('messages');
messagesDiv.setAttribute('id', 'messages');

const inputField = document.createElement('input');
inputField.setAttribute('type', 'text');
inputField.setAttribute('id', 'messageInput');
inputField.setAttribute('placeholder', 'Type a message...');

const sendButton = document.createElement('button');
sendButton.innerText = 'Send';
sendButton.setAttribute('id', 'sendButton');
sendButton.onclick = sendMessage;

chatContainer.appendChild(messagesDiv);
chatContainer.appendChild(inputField);
chatContainer.appendChild(sendButton);
document.body.appendChild(chatContainer);

const chatMessages = document.getElementById('messages');
const badge = document.getElementById('notification-count');
const notificationContainer = document.createElement('div');
notificationContainer.classList.add('notification-list');
document.body.appendChild(notificationContainer);

// Variables to track notifications and messages
let newMessageCount = 0;
const messageTitles = [];

//static data to test only later dynamic in real clientside
const limit = 10;
const conversationId = 1;
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzAxMjkxNDM3LCJleHAiOjE3MDE4OTYyMzd9.ehD9vE0Vf2fCzfIXy6pVM4KxEsDc4JwgUEKFAKtn5LE";
const loggedInUserId = 1;
let LastMsgID = 1;

// Connect to the Socket.IO server
const socket = io('http://localhost:8080', {
  extraHeaders: {
    Authorization: `Bearer ${token}`
  }
});


// Event listeners and socket handling
socket.on('connect', () => {
  socket.emit('joinRoom', conversationId);
});

socket.on('newMessage', handleNewMessage);

document.addEventListener('newMessageNotification', handleNewMessageNotification);
badge.addEventListener('click', clearNotification);
messagesDiv.addEventListener('scroll', handleScroll);
sendFileButton.addEventListener('click', () => {
  const file = fileInput.files[0];
  if (file) {
    uploadFile(file);
  } else {
    alert('Please select a file');
  }
});


// Functions

function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const messageContent = messageInput.value.trim();
 socket.emit('sendMessage', {
    conversationId,
    sender: loggedInUserId,
    content: messageContent
  });
  messageInput.value = '';
}

async function handleNewMessage(message) {
  const response = await axios.get(`${API_URL}/user/name/${message.sender}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const senderName = response.data.firstName || 'Unknown';
  message.senderName = senderName;
  console.log("in handle new messages")
  renderMessages([message], chatMessages, loggedInUserId, false);

  if (message.sender !== loggedInUserId) {
    updateNotificationAndTitles(senderName);
  }
}

function updateNotificationAndTitles(senderName) {
  newMessageCount++;
  messageTitles.push(`New message from ${senderName}`);
  updateNotificationUI(newMessageCount);
  showNotificationList();
}

function updateNotificationUI(count) {
  badge.textContent = count;
}

function showNotificationList() {
  notificationContainer.innerHTML = '';
  messageTitles.forEach(title => {
    const notificationItem = document.createElement('div');
    notificationItem.textContent = title;
    notificationContainer.appendChild(notificationItem);
  });
}

function handleNewMessageNotification(event) {
  const { title } = event.detail;
  messageTitles.push(title);
  showNotificationList();
}

function clearNotification() {
  newMessageCount = 0;
  messageTitles.length = 0;
  updateNotificationUI(newMessageCount);
  showNotificationList();
}

function handleScroll() {
  // Handling scrolling for fetching older messages
  if (messagesDiv.scrollTop === 0) {
    console.log('Scrolled up');

    fetchPreviousMessages(conversationId, limit, token, LastMsgID)
      .then(olderMessages => {
        if (olderMessages.length > 0) {
          renderMessages(olderMessages, chatMessages, loggedInUserId, true);
          LastMsgID = olderMessages[olderMessages.length - 1]._id;
        }
      })
      .catch(error => {
        console.log('Error fetching previous messages:', error);
      });
  }
}

async function fetchPreviousMessages(conversationId, limit, token, LastMsgID) {
  try {
    const response = await axios.get(`${API_URL}/OneConversation/${conversationId}?lastID=${LastMsgID}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data[0].messages;
  } catch (error) {
    console.log('Error fetching previous messages:', error);
    return [];
  }
}

//file upload

function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  axios.post(`${API_URL}/chat/uploadFile/${conversationId}`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(response => {
    console.log('File uploaded:', response.data);
   
  })
  .catch(error => {
    console.error('Error uploading file:', error);
  });
}
  // Fetch and render initial latest messages
  fetchLatestMessages(conversationId, limit, token)
  .then(messages => {
  
    renderMessages(messages, chatMessages, loggedInUserId);
  });

async function fetchLatestMessages(conversationId, limit, token) {
    try {
      const response = await axios.get(`${API_URL}/OneConversation/${conversationId}?limit=${limit}`, {
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

function renderMessages(messages, chatMessages, loggedInUserId, prepend = false) {
  messages.forEach(message => {
    const messageDiv = document.createElement('div');
    const senderName = message.sender.firstName || message.senderName;
    const content = message.content || 'No content';
    messageDiv.textContent = `${senderName}: ${content}`;
console.log(messageDiv.textContent)
    
    if (content === 'file') {
      const fileLink = document.createElement('a');
      fileLink.href = `${API_URL}/chat/downloadFile/${message.fileName}`; // Update this URL to the correct download endpoint
      fileLink.textContent = `File: ${message.fileName}`;
      fileLink.setAttribute('download', message.fileName);
      messageDiv.appendChild(fileLink);

      fileLink.addEventListener('click', (event) => {
        event.preventDefault();
        downloadFile(message.fileName);
      });

    }

    if (content != 'file' || content != 'No content') {
      if (!prepend) {
        chatMessages.appendChild(messageDiv);
      } else {
        chatMessages.insertBefore(messageDiv, chatMessages.firstChild);
      }
    }
  });
}

async function downloadFile(filename) {
  console.log(filename)
  try {
    const response = await axios.get(`${API_URL}/chat/downloadFile/${filename}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
   
    return true;
  } catch (error) {
    console.log('Error fetching latest messages:', error);
    return [];
  }
}