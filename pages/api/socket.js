import config from '@/config';
import { Server } from 'socket.io';

// Object to store room data
const rooms = {};

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('socket already running');
  } else {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;
    io.on('connection', (socket) => {
      console.log('server is connected');
      socket.on('join-room', (roomId, userId) => {
        console.log(`a new user ${userId} joined room ${roomId}`);

        // Check if the room exists
        if (!rooms[roomId]) {
          rooms[roomId] = { participants: [] };
        }

        const room = rooms[roomId];
        // Check if the room has fewer than 2 participants
        if (room.participants.length < config.userLimit) {
          // Add the participant to the room
          room.participants.push(userId);
          socket.join(roomId);
          socket.broadcast.to(roomId).emit('user-connected', userId);
        } else {
          // Room is full, send an error message to the user
          socket.emit('room-full');
        }
      });

      socket.on('user-toggle-audio', (userId, roomId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-toggle-audio', userId);
      });

      socket.on('user-toggle-video', (userId, roomId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-toggle-video', userId);
      });

      socket.on('user-leave', (userId, roomId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-leave', userId);
        // Remove the user from the room
        if (rooms[roomId]) {
          rooms[roomId].participants = rooms[roomId].participants.filter(
            (id) => id !== userId
          );
        }
      });
    });
  }
  res.end();
};

export default SocketHandler;
