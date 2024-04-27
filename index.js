const express = require('express')
const http = require('http');
const { Server } = require('socket.io');
const handleIoTWebSocket = require('./routes/iotSocket');
const handleFrontendWebSocket = require('./routes/frontendSocket');
const cors = require('cors');
const {prisma, getLatestMessage, getAllMessages, cache} = require('./db.js');


cache.set("buzzer", false)
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const port = 8000

// Enable CORS for all origins
app.use(cors());

// Include IoT WebSocket handlers
handleIoTWebSocket(io);

// Include Frontend WebSocket handler
handleFrontendWebSocket(io);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/messages', async (req, res) => {
  const messages = await getAllMessages();
  res.json(messages);
});

app.get('/visitor-history', async (req, res) => {
  try {
    const visitorHistory = await prisma.visitorLog.findMany();
    res.json(visitorHistory);
  } catch (error) {
    console.error('Error fetching visitor history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/latest-message', async (req, res) => {
  try {
    const latestMessage = await getLatestMessage();
    res.json({"message": latestMessage});
  } catch (error) {
    console.error('Error fetching visitor history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE endpoint to delete a message by ID
app.delete('/messages/:id', async (req, res) => {
  const messageId = parseInt(req.params.id);
  try {
    // Delete the message from the database
    await prisma.message.delete({
      where: {
        id: messageId,
      },
    });
    res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.get('/buzzer-status', async (req, res) => {
  try {
    const status = cache.get("buzzer");
    res.json({"status": status});
  } catch (error) {
    console.error('Error fetching visitor history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
