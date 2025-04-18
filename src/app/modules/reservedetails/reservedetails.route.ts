import validateRequest from '../../middlewares/validateRequest';
import { ReserveDetailsValidations } from './reservedetails.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { getMultipleFilesPath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { ReserveDetailsController } from './reservedetails.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
const router = express.Router();
// create
router.post(
  '/',

  fileUploadHandler(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if the required files are uploaded for drivingLicense and yourID
      // @ts-ignore
      const drivingLicense = getMultipleFilesPath(req.files, 'drivingLicense');
      // @ts-ignore
      const yourID = getMultipleFilesPath(req.files, 'yourID');

      // If either of the files is not uploaded, return an error
      if (!drivingLicense || !yourID) {
        return sendResponse(res, {
          statusCode: 400,
          success: false,
          message: 'Both drivingLicense and yourID are required',
        });
      }
      req.body = {
        ...req.body,
        drivingLicense,
        yourID,
      };

      next();
    } catch (error) {
      sendResponse(res, {
        statusCode: 500,
        success: false,
        message: 'Error while uploading files',
      });
    }
  },
  validateRequest(ReserveDetailsValidations.reserveDetailsSchema),
  auth(USER_ROLES.USER),
  ReserveDetailsController.createReserveDetails
);

// get all reserve details
router.get(
  '/',
  auth(USER_ROLES.USER, USER_ROLES.AGENCY),
  ReserveDetailsController.getAllReserveDetails
);

// specific user reserve details
router.get(
  '/specific',
  auth(USER_ROLES.USER, USER_ROLES.AGENCY),
  ReserveDetailsController.getSpecificReserveDetails
);
// get single
router.get('/:id', ReserveDetailsController.getSingleReserveDetails);

// delete
router.delete('/:id', ReserveDetailsController.deleteReserveDetails);

// update
router.patch(
  '/:id',
  fileUploadHandler(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if the required files are uploaded for drivingLicense and yourID
      // @ts-ignore
      const drivingLicense = getMultipleFilesPath(req.files, 'drivingLicense');
      // @ts-ignore
      const yourID = getMultipleFilesPath(req.files, 'yourID');
      req.body = {
        ...req.body,
        drivingLicense,
        yourID,
      };

      next();
    } catch (error) {
      sendResponse(res, {
        statusCode: 500,
        success: false,
        message: 'Error while uploading files',
      });
    }
  },
  ReserveDetailsController.updateReserveDetails
);
export const reserveDetailsRoutes = router;
