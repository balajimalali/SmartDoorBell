const { Server } = require('socket.io');
const {prisma, getLatestMessage, mailer} = require('../db.js');

function getCurrentDateTime() {
  const currentDate = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  };

  return currentDate.toLocaleString('en-US', options);
}

async function sendAlertEmail(date) {
  try {
    // Fetch all subscribed email addresses
    const subscriptions = await prisma.notificationSubscription.findMany({
      where: { status: true }, // Assuming you only want to send emails to subscribed users
    });

    let receiver = "";

    // Loop through each subscriber and send an email
    for (const subscription of subscriptions) {
      if(receiver===""){
        receiver += subscription.email
      }
      else{
        receiver += ", ";
        receiver += subscription.email
      }
    }

      await mailer.sendMail({
        from: 'balaji@gmail.com',
        to: receiver,
        subject: "Door Bell", // Subject line
        text: "An visitor detected at " + date, // plain text body
        // html: "<b>Hello world?</b>", // html body

      }); 
    console.log(receiver)
    console.log('Alert emails sent successfully');
  } catch (error) {
    console.error('Error sending alert emails:', error);
  }
}

function handleIotWebSocket(io) {
  const ioIOT = io.of('/');

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
      sendAlertEmail(getCurrentDateTime());
      await prisma.visitorLog.create({
        data: {
          message: JSON.stringify(data)
        }
      });

      io.of('/frontend').emit("visitor", [Date.now(), data]);
    });
  });
}

module.exports = handleIotWebSocket;
