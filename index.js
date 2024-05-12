const express = require('express')
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const handleIoTWebSocket = require('./routes/iotSocket');
const handleFrontendWebSocket = require('./routes/frontendSocket');
const cors = require('cors');
const bodyParser = require('body-parser');
const {prisma, getLatestMessage, getAllMessages, cache} = require('./db.js');
require('dotenv').config()

cache.set("buzzer", true)
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const port = 9000

// Enable CORS for all origins
app.use(cors());


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './frontend/build')));

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

// Route to add email subscription
app.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email already exists
    const existingSubscription = await prisma.NotificationSubscription.findFirst({
      where: { email },
    });

    if (existingSubscription) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }

    // Create new subscription
    const newSubscription = await prisma.NotificationSubscription.create({
      data: {
        email,
        status: true, // Assuming new subscriptions start as unsubscribed
      },
    });

    const subscriptions = await prisma.NotificationSubscription.findMany();

    res.json(subscriptions);
  } catch (error) {
    console.error('Error subscribing email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get all subscriptions
app.get('/subscriptions', async (req, res) => {
  try {
    const subscriptions = await prisma.notificationSubscription.findMany();
    res.json(subscriptions);
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to delete subscription
app.delete('/unsubscribe/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.notificationSubscription.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
