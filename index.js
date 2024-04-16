const express = require('express')
const http = require('http');
const { Server } = require('socket.io');
const handleIoTWebSocket = require('./routes/iotSocket');
const handleFrontendWebSocket = require('./routes/frontendSocket');
const cors = require('cors');
const {prisma, getLatestMessage, getAllMessages} = require('./db.js');

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


server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
