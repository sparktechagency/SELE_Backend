import mongoose from 'mongoose';
import { IMessage, MessageModel } from './message.interface';
import { Message } from './message.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { sendNotifications } from '../../../helpers/notificationSender';

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

const getMessageFromDB = async (id: string, query: Record<string, any>) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid chat ID');
  }
  const baseQuery = Message.find({ chatId: id });
  const result = new QueryBuilder(baseQuery, query);
  const messages = await result.modelQuery.populate(
    'sender',
    'name avatar image'
  );
  const pagination = await result.getPaginationInfo();

  if (!messages) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Message not found');
  }
  return { pagination, messages };
};

export const MessageServices = { sendMessageToDB, getMessageFromDB };
