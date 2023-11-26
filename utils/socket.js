// server.js
const express = require("express");
const JWT= require("jsonwebtoken");
const { promisify } = require("util")
const mongoose=require("mongoose");
require("./../Models/UserModel")
const UserSchema=mongoose.model("user");

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
io.on('connection', async (socket) => {
   // console.log('A user connected');

  const token = socket.handshake.headers.authorization.split(' ')[1];

  if(!token){
    return next(new AppError('You\'re not logged in, please go to login page',401));
    }
    const decoded = await promisify(JWT.verify)(token,process.env.JWT_SECRET);
     await  UserSchema.findByIdAndUpdate(decoded.id, { Status: 'online' }, { new: true });

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
  socket.on('disconnect', async () => {
   // console.log('A user disconnected');
     await  UserSchema.findByIdAndUpdate(decoded.id, { Status: 'offline' }, { new: true });

  });
});


module.exports = {
  io,
  server,
  app,
};
