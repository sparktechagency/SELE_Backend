import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IChat } from './chat.interface';
import { Chat } from './chat.model';


const createChatToDB = async (payload: IChat) => {
    const isExistChat: IChat | null = await Chat.findOne({
        participants: { $all: payload },
    });
    if (isExistChat) {
        return isExistChat
    }
    const result = await Chat.create({ participants: payload })
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create room")
    }
    return result
}

const getChatFromDB = async (friends: string[]) => {
    const result = await Chat.find({
        participants: { $in: friends }
    })
        .populate('participants')
        .lean();

    const filteredResult = result.filter((chat: any) => chat?.participants?.length > 0);
    return { friends: filteredResult }
}



export const ChatServices = { createChatToDB, getChatFromDB };
