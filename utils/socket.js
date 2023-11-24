// server.js
const socketIO = require("socket.io");
const express = require("express");
const chatController=require("./../Controllers/chatController");

const app = express();
const server = require("http").createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined room: ${conversationId}`);

    // Other event listeners and logic
  });

  socket.on('sendMessage', async ({ conversationId, sender, receiver, content }) => {
    try {
      const message = await chatController.addMessageToConversation(conversationId, sender, receiver, content);
      console.log(message, "Message sent");

      io.to(conversationId).emit('newMessage', message); // Emit message to users in the conversation room
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


module.exports = {
  io,
  server,
  app,
};
