const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store users and channels
const users = new Map();
const channels = new Map([
  ['general', { name: 'general', messages: [] }],
  ['random', { name: 'random', messages: [] }],
  ['wizards-only', { name: 'wizards-only', messages: [] }]
]);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join', (userData) => {
    users.set(socket.id, {
      id: socket.id,
      username: userData.username,
      avatar: userData.avatar,
      status: 'online'
    });
    
    // Send current channels and users to the new user
    socket.emit('channels', Array.from(channels.values()));
    socket.emit('users', Array.from(users.values()));
    
    // Broadcast new user to others
    socket.broadcast.emit('user-joined', users.get(socket.id));
  });

  // Handle joining a channel
  socket.on('join-channel', (channelName) => {
    socket.join(channelName);
    if (channels.has(channelName)) {
      socket.emit('channel-messages', {
        channel: channelName,
        messages: channels.get(channelName).messages
      });
    }
  });

  // Handle new messages
  socket.on('message', (data) => {
    const user = users.get(socket.id);
    if (user && channels.has(data.channel)) {
      const message = {
        id: Date.now(),
        username: user.username,
        avatar: user.avatar,
        content: data.content,
        timestamp: new Date().toISOString(),
        channel: data.channel
      };
      
      channels.get(data.channel).messages.push(message);
      io.to(data.channel).emit('new-message', message);
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(data.channel).emit('user-typing', {
        username: user.username,
        channel: data.channel
      });
    }
  });

  socket.on('stop-typing', (data) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(data.channel).emit('user-stop-typing', {
        username: user.username,
        channel: data.channel
      });
    }
  });

  // Handle file uploads
  socket.on('file-upload', (data) => {
    const user = users.get(socket.id);
    if (user && channels.has(data.channel)) {
      const fileMessage = {
        id: Date.now(),
        username: user.username,
        avatar: user.avatar,
        timestamp: new Date().toISOString(),
        channel: data.channel,
        file: data.file
      };
      
      channels.get(data.channel).messages.push(fileMessage);
      io.to(data.channel).emit('file-message', fileMessage);
    }
  });

  // Handle server switching
  socket.on('switch-server', (serverId) => {
    if (serverId === 'home') {
      // Send default channels for home server
      socket.emit('channels', Array.from(channels.values()));
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      socket.broadcast.emit('user-left', user);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`🧙‍♂️ Wizardin server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});