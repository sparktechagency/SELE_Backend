import { Request, Response, NextFunction } from 'express';
import { MessageServices } from './message.service';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import ApiError from '../../../errors/ApiError';

const sendMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user?._id || req.body.sender;
    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Have no user!!!');
    }

    let messageImage;
    if (req.files && 'messageImage' in req.files && req.files.messageImage[0]) {
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
      message: 'Message sent successfully',
      data: message,
    });
  }
);

const getMessage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MessageServices.getMessageFromDB(
    id,
    req.user,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Messages fetched successfully',
    data: result,
  });
});

export const MessageController = { sendMessage, getMessage };
