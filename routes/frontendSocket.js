const { Server } = require('socket.io');
const {prisma, getLatestMessage, cache} = require('../db.js');

function handleFrontendWebSocket(io) {
  const ioFrontend = io.of('/frontend');

  ioFrontend.on('connection', (socket) => {
    console.log('A frontend client connected to Frontend WebSocket');

    // Handle frontend WebSocket logic here
    socket.on('messageUpdate', async (message) => {
      console.log('Received message:', message);
      // Save message to the database
      try{
        let newMessage = await prisma.message.create({
          data: {
            message: message
          }
        });

        cache.set("latestMessage", newMessage);

        io.of('/').emit('setMessage', newMessage)
        socket.emit('updateStatus', 'success')
      }
      catch(error){
        console.log(error)
      }

    });

    socket.on('messageSet', async (id) => {
      console.log('Received id:', id);
      // Save message to the database
      try{
        const message = await prisma.message.findFirst({
          where: {
            id: id
          }
        });
        cache.set("latestMessage", message);

        io.of('/').emit('setMessage', message)
        socket.emit('updateStatus', 'success')
      }
      catch(error){
        console.log(error)
      }

    });

    socket.on('toggleBuzzer', (status) => {
      // Emit updated buzzer status to all clients
      cache.set("buzzer", status);
      io.of('/').emit("buzzer", status);
    });

  });
}

module.exports = handleFrontendWebSocket;
