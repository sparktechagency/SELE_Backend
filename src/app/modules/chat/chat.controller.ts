import { Request, Response, NextFunction } from 'express';
import { ChatServices } from './chat.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createChat = catchAsync(async (req: Request, res: Response) => {
    const { participant } = req.body
    console.log("req.user",req.user);
    const payload = [req.user?.id, participant]
    const result = await ChatServices.createChatToDB(payload as any)
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Chat created successfully",
        data: result
    })
})


const getChat = catchAsync(async (req: Request, res: Response) => {
const result = await ChatServices.getChatFromDB(req.user);
 
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Chat fetched successfully',
      data: result,
    });
  });
  
export const ChatController = { createChat, getChat };