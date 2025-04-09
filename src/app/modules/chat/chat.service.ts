import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IChat } from './chat.interface';
import { Chat } from './chat.model';
import mongoose from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';

const createChatToDB = async (payload: IChat) => {
  const isExistChat: IChat | null = await Chat.findOne({
    participants: { $in: payload },
  });
  if (isExistChat) {
    return isExistChat;
  }
  const result = await Chat.create({ participants: payload });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create room');
  }
  return result;
};

const getChatFromDB = async (user: JwtPayload) => {
  const chats = await Chat.find({
    participants: { $in: [user.id] },
  })
    .populate({
      path: 'participants',
      select: 'name image -_id',
      match: {
        _id: {
          $ne: user.id,
        },
      },
    })
    .lean()
    .exec();

  const chatsWithLastMessage = await Promise.all(
    chats.map(async( chat:any) => {
        const {_id, participants} = chat;
        const participant = participants[0];
        // find the latest message from this chat
        const lastMessage = await Chat.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(_id) } },
          { $unwind: '$messages' },
          { $sort: { 'messages.createdAt': -1 } },
          { $limit: 1 },
          { $project: { 'messages': 1 } },      
        ])
      return {
        _id,
        ...participant,
        lastMessage: lastMessage || null,
      }
    })
  );

  return chatsWithLastMessage;
};

export const ChatServices = { createChatToDB, getChatFromDB };
