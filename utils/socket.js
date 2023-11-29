// server.js
const express = require("express");
const JWT= require("jsonwebtoken");
const axios = require("axios")
const { promisify } = require("util")

const chatController=require("./../Controllers/chatController");
const AppError = require("./appError");

const app = express();
const server = require("http").createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST','patch']
  }
});

// Socket.IO Connection Handling
io.on('connection', async (socket) => {

  const token = socket.handshake.headers.authorization.split(' ')[1];
  if(!token){
    throw new Error('You\'re not logged in, please go to login page');
    }
    const decoded = await promisify(JWT.verify)(token,process.env.JWT_SECRET);

    //change the user status to online
    axios.patch(`http://localhost:8080/user/changeStatus/${decoded.id}?status=online`).catch(error => {
    console.error('Error updating status:', error);
  });

  socket.on('joinRoom', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined room: ${conversationId}`);

  });

  socket.on('sendMessage', async ({ conversationId, sender, content }) => {
    try {
      const message = await chatController.addMessageToConversation(conversationId, sender, content);

      io.to(conversationId).emit('newMessage', message); // Emit message to users in the conversation room

    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    //change the user status to offline
   axios.patch(`http://localhost:8080/user/changeStatus/${decoded.id}?status=offline`).catch(error => {
    console.error('Error updating status:', error);
  });

  });
});


module.exports = {
  io,
  server,
  app,
};