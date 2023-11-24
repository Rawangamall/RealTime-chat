// server.js
const socketIO = require("socket.io");
const express = require("express");

const app = express();
const server = require("http").createServer(app);
const io = socketIO(server);

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle incoming messages
  socket.on('sendMessage', async ({ conversationId, sender, receiver, content }) => {
    try {
      const message = await addMessageToConversation(conversationId, sender, receiver, content);
      io.emit(`conversation-${conversationId}`, message); // Emit message to all clients in the conversation
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
