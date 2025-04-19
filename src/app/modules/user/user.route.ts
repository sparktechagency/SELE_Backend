import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import ApiError from '../../../errors/ApiError';
const router = express.Router();

router
  .route('/profile')
  .get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.AGENCY), UserController.getUserProfile)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER,USER_ROLES.AGENCY),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        
        // Parse the data from the request body
        const parsedData = JSON.parse(req.body.data);
      
        // Safely convert latitude and longitude to numbers
        if (parsedData.latitude) {
          const latitude = parseFloat(parsedData.latitude);
          // Check if latitude is a valid number and within the valid range
          if (isNaN(latitude)) {
            throw new ApiError(400, 'Latitude must be a valid number');
          }
          if (latitude < -90 || latitude > 90) {
            throw new ApiError(400, 'Latitude must be between -90 and 90');
          }
          parsedData.latitude = latitude;
        }
      
        if (parsedData.longitude) {
          const longitude = parseFloat(parsedData.longitude);
          // Check if longitude is a valid number and within the valid range
          if (isNaN(longitude)) {
            throw new ApiError(400, 'Longitude must be a valid number');
          }
          if (longitude < -180 || longitude > 180) {
            throw new ApiError(400, 'Longitude must be between -180 and 180');
          }
          parsedData.longitude = longitude;
        }
      
        // Now validate the parsed data using the Zod schema
        req.body = UserValidation.updateUserZodSchema.parse(parsedData);
      }
      return UserController.updateProfile(req, res, next);
    }
  );

router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  );
router.post('/verify-otp', UserController.verifyUserOTP);
export const UserRoutes = router;
