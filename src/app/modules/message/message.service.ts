import mongoose from 'mongoose';
import { IMessage } from './message.interface';
import { Message } from './message.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { sendNotifications } from '../../../helpers/notificationSender';
import { JwtPayload } from 'jsonwebtoken';
import { Chat } from '../chat/chat.model';

const sendMessageToDB = async (payload: IMessage) => {
  const response = await Message.create(payload);
  const newMessage = await Message.findOne({ _id: response._id }).populate(
    'sender',
    'name, image, name'
  );
  console.log(response);
  //@ts-ignore
  const io = global.io;
  if (io) {
    io.to(payload.chatId.toString()).emit('newMessage', newMessage);
  }
  const notificationPayload = {
    userId: newMessage?._id,
    title: 'New Message',
    message: `You have a new message from ${(newMessage?.sender as any)?.name}`,
    type: 'Message Send',
  };

  await sendNotifications(notificationPayload as any);

  return newMessage;
};

// const getMessageFromDB = async (chatId: string, user: JwtPayload) => {
//   if (!mongoose.Types.ObjectId.isValid(chatId)) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid chat ID');
//   }
//   console.log(chatId);
//   const chat = await Chat.findById(chatId);
//   console.log(chat);
//   // @ts-ignore
//   const isParticipant = chat?.participants[1];
//   if (!isParticipant) {
//     throw new ApiError(
//       StatusCodes.FORBIDDEN,
//       'You are not a participant in this chat'
//     );
//   }

//   // 3. Find all messages for this chatId
//   const messages = await Message.find({ chatId })
//     .populate({
//       path: 'sender',
//       select: 'name image email',
//     })
//     .sort({ createdAt: -1 })
//     .lean()
//     .exec();

//   return messages;
// };


// todo: work not complete
const getMessageFromDB = async (chatId: string, user: JwtPayload) => {
  console.log('chatId', chatId);

  // 1. Validate chatId
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid chat ID');
  }

const query = Message.find({ chatId: chatId?._conditions?.chatId })

  const chat = await Chat.findById(query).populate("sender").lean().exec();
  console.log("chat", chat?.participants);
  // console.log('Chat document:', chat);
  // if (!chat?.participants || !Array.isArray(chat.participants)) {
  //   console.error('Invalid participants format:', chat?.participants);
  //   throw new ApiError(
  //     StatusCodes.INTERNAL_SERVER_ERROR,
  //     'Invalid chat format'
  //   );
  // }

  console.log('Participants:', chat?.participants);
  console.log('Current user ID:', user.userId);

  const isParticipant = chat?.participants.some(
    participant => participant.toString() === user.userId
  );

  if (!isParticipant) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not a participant in this chat'
    );
  }

  // 4. Find messages
  const messages = await Message.find({ chatId })
    .populate('sender', 'name image email')
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return messages;
};

export const MessageServices = { sendMessageToDB, getMessageFromDB };
