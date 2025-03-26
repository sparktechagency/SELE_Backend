import { Request, Response, NextFunction } from 'express';
import { ChatServices } from './chat.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createChat = catchAsync(async (req: Request, res: Response) => {
    const { participants } = req.body
    const result = await ChatServices.createChatToDB(participants)
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Chat created successfully",
        data: result
    })
})


const getChat = catchAsync(async (req: Request, res: Response) => {
    const { friends } = req.body
    console.log("friends=======>>>>>>", friends);
    // @ts-ignore
    const result = await ChatServices.getChatFromDB(friends)
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Chat fetched successfully",
        data: result
    })
})
export const ChatController = { createChat, getChat };