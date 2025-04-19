import express, { NextFunction, Request, Response } from 'express';
import { MessageController } from './message.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import sendResponse from '../../../shared/sendResponse';
import { getMultipleFilesPath } from '../../../shared/getFilePath';

const router = express.Router();

router.post(
  '/',
  fileUploadHandler(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const messageImage = getMultipleFilesPath(req.files, 'messageImage');

      // Map the car data with the correct fields
      req.body = {
        ...req.body,
        messageImage,
      };

      // Proceed to the next middleware or controller
      next();
    } catch (error) {
      sendResponse(res, {
        statusCode: 500,
        success: false,
        message: 'Error while uploading message image',
      });
    }
  },
  MessageController.sendMessage
);
router.get(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.AGENCY),
  MessageController.getMessage
);

export const MessageRoutes = router;
