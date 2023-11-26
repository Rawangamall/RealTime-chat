// server.js
const socketIO = require("socket.io");
const express = require("express");
const JWT= require("jsonwebtoken");
const axios = require("axios")
const { promisify } = require("util")
const mongoose=require("mongoose");
require("./../Models/UserModel")
const UserSchema=mongoose.model("user");

const chatController=require("./../Controllers/chatController");
const AppError = require("./appError");
const catchAsync = require("./CatchAsync");

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
    return next(new AppError('You\'re not logged in, please go to login page',401));
    }
    const decoded = await promisify(JWT.verify)(token,process.env.JWT_SECRET);

  const response = await axios.patch(`http://localhost:8080/user/changeStatus/${decoded.id}?status=online`);
  //console.log(response,'A user connected')
  
  socket.on('joinRoom', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined room: ${conversationId}`);

  });

  socket.on('sendMessage', async ({ conversationId, sender, receiver, content }) => {
    try {
      const message = await chatController.addMessageToConversation(conversationId, sender, receiver, content);
      console.log("Message sent");

      io.to(conversationId).emit('newMessage', message); // Emit message to users in the conversation room
      console.log(conversationId,"Message newMessage");

    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
   const responses = await axios.patch(`http://localhost:8080/user/changeStatus/${decoded.id}?status=offline`);
  // console.log(responses,'A user disconnected')

  });
});


module.exports = {
  io,
  server,
  app,
};