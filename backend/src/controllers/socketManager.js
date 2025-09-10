import { json } from "express";
import { Server } from "socket.io";
export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });
  const connections = {};
  const timeOnline = {};
  const messages = {};

  io.on("connection", (socket) => {
    console.log("something connected");
    socket.on("join-call", (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }
      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();
      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path]
        ); //a=index of user in room
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      let matchingRoom = "";
      let found = false;
      for (const [roomKey, roomValue] of Object.entries(connections)) {
        if (roomValue.includes(socket.id)) {
          matchingRoom = roomKey;
          found = true;
          break;
        }
      }
      if (found) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }
        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });

        console.log("message", matchingRoom, ":", sender, data);

        connections[matchingRoom].forEach((elem) => {
          io.to(elem).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    socket.on("disconnect", () => {
      var diffTime = Math.abs(timeOnline[socket.id] - new Date());

      // find the single room containing this socket
      let foundRoom = null;
      for (const [room, list] of Object.entries(connections)) {
        if (list.includes(socket.id)) {
          foundRoom = room;
          break;
        }
      }
      if (!foundRoom) return; // nothing to do

      connections[foundRoom].forEach((id) => {
        io.to(id).emit("user-left", socket.id);
      });

      connections[foundRoom] = connections[foundRoom].filter(
        (id) => id !== socket.id
      );

      if (connections[foundRoom].length === 0) {
        delete connections[foundRoom];
      }
    });
  });

  return io;
};
