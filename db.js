const { PrismaClient } = require('@prisma/client');
const NodeCache = require( "node-cache" );
const nodemailer = require('nodemailer');

const myCache = new NodeCache();
const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'Gmail',  
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Function to get the latest message

const getLatestMessage = async () => {
  if(myCache.get( "latestMessage" )){
    return myCache.get( "latestMessage" );
  }
  const latestMessage = await prisma.message.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  return latestMessage? latestMessage : {'id':0, 'message':'No message available'};
};

const getAllMessages = async () => {
  const messages = await prisma.message.findMany();
  return messages;
};



module.exports = {
	"prisma": prisma,
	"getLatestMessage": getLatestMessage,
  "getAllMessages": getAllMessages,
  "cache": myCache,
  "mailer": transporter,
}