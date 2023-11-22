const socketIO = require("socket.io");
const express = require("express");

const app = express();
const server = require("http").createServer(app);
const io = socketIO(server);

module.exports = {
  io,
  server,
  app,
};