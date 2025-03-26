import mongoose from 'mongoose';
import { IMessage, MessageModel } from './message.interface';
import { Message } from './message.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';

const sendMessageToDB = async (payload: IMessage) => {
    const response = await Message.create(payload);
    const newMessage = await Message.findOne({ _id: response._id }).populate("sender");

    //@ts-ignore
    const io = global.io;
    if (io) {
        io.to(payload.chatId.toString()).emit("newMessage", newMessage);
    }

    return response;
}

const getMessageFromDB = async (id: any, query: Record<string, any>) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid id');
    }

    const result = new QueryBuilder(Message.find({ chatId: id }), query);
    const message = await result.modelQuery.populate("sender");
    const pagination = await result.getPaginationInfo();

    return { message, pagination };
}

export const MessageServices = { sendMessageToDB, getMessageFromDB };
