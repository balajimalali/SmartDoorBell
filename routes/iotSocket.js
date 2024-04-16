const { Server } = require('socket.io');
const {prisma, getLatestMessage} = require('../db.js');


function handleIotWebSocket(io) {
  const ioIOT = io.of('/iot');

  ioIOT.on('connection', async (socket) => {
    console.log('A device connected');

    // Send the latest message to the newly connected device
    const latestMessage = await getLatestMessage();
    socket.emit('setMessage', latestMessage);
    // socket.emit('deviceStatus', deviceStatuses);

    // Handle receiving visitor data
    socket.on('visitorData', async (data) => {
      console.log('Received visitor data:', data);
      // Save visitor data to the database
      await prisma.visitorLog.create({
        data: {
          message: data.message
        }
      });

      io.of('/frontend').emit("visitor", [Date.now(), data.message]);
    });
  });
}

module.exports = handleIotWebSocket;
