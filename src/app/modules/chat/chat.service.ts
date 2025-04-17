import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IChat } from './chat.interface';
import { Chat } from './chat.model';
import mongoose from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';

const createChatToDB = async (payload: IChat, user: JwtPayload) => {
  if (!payload.participants || !Array.isArray(payload.participants)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Participants must be an array'
    );
  }

  const uniqueParticipants = [
    ...new Set([...payload.participants, user.userId]),
  ];

  const objectIds = uniqueParticipants
    .map(id => new mongoose.Types.ObjectId(id))
    .sort((a, b) => a.toString().localeCompare(b.toString()));
  const existingChat = await Chat.findOne()
    .populate({
      path: 'participants',
      select: 'name email image _id',
    })
    .lean();
  if (existingChat) {
    return existingChat;
  }
  const createdChat = await Chat.create({ participants: objectIds });

  const populatedNewChat = await Chat.findById(createdChat._id)
    .populate({
      path: 'participants',
      select: 'name email image _id',
    })
    .lean();

  return populatedNewChat;
};

const getChatFromDB = async (user: JwtPayload) => {
  const userIdObj = new mongoose.Types.ObjectId(user.id);
  const chats = await Chat.find({
    participants: { $in: [userIdObj] },
  })
    .populate({
      path: 'participants',
      select: 'name email image _id',
    })
    .lean()
    .exec();
  return chats;
};

export const ChatServices = { createChatToDB, getChatFromDB };
