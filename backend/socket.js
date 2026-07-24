const socketHandler = (io, socket) => {
  // Join a room for collaboration
  socket.on('join:room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user:joined', socket.id);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Leave room
  socket.on('leave:room', (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user:left', socket.id);
  });

  // Editor cursor position
  socket.on('cursor:move', (data) => {
    const { roomId, position } = data;
    socket.to(roomId).emit('cursor:updated', {
      userId: socket.id,
      position
    });
  });

  // Editor content change
  socket.on('editor:change', (data) => {
    const { roomId, content } = data;
    socket.to(roomId).emit('editor:updated', {
      userId: socket.id,
      content
    });
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { roomId, isTyping } = data;
    socket.to(roomId).emit('typing:indicator', {
      userId: socket.id,
      isTyping
    });
  });

  // File changes
  socket.on('file:change', (data) => {
    const { roomId, filePath, content } = data;
    socket.to(roomId).emit('file:updated', {
      userId: socket.id,
      filePath,
      content
    });
  });

  // Chat message
  socket.on('chat:message', (data) => {
    const { roomId, message } = data;
    io.to(roomId).emit('chat:message', {
      userId: socket.id,
      message,
      timestamp: new Date().toISOString()
    });
  });
};

module.exports = socketHandler;
