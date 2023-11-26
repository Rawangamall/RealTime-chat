
  
  // Fetch and render initial latest messages
  fetchLatestMessages(conversationId, limit, token)
  .then(messages => {
  
    renderMessages(messages, chatMessages, loggedInUserId);
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
  
