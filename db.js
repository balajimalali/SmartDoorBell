const { PrismaClient } = require('@prisma/client');
const NodeCache = require( "node-cache" );

const myCache = new NodeCache();
const prisma = new PrismaClient();

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
}