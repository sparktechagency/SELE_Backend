import { Request, Response, NextFunction } from 'express';
import { MessageServices } from './message.service';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';

const sendMessage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user?._id;
    let messageImage;

    // Check if message image is uploaded
    if (req.files && "messageImage" in req.files && req.files.messageImage[0]) {
        messageImage = `/messageImage/${req.files.messageImage[0].filename}`;
    }

    const payload = {
        messageImage: messageImage,
        sender: user,
        ...req.body,
    };

    const message = await MessageServices.sendMessageToDB(payload);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Message sent successfully",
        data: message,
    });
});

const getMessage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const messages = await MessageServices.getMessageFromDB(req.params.id, req.query);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Messages fetched successfully",
        data: messages,
    });
});

export const MessageController = { sendMessage, getMessage };
