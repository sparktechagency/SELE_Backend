import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
const router = express.Router();

router.post(
  '/login',
  validateRequest(AuthValidation.createLoginZodSchema),
  AuthController.loginUser
);
router.post(
  '/refresh-token',
  AuthController.newAccessToken
);
router.post(
  '/forget-password',
  validateRequest(AuthValidation.createForgetPasswordZodSchema),
  AuthController.forgetPassword
);

router.post(
  '/verify-email',
  validateRequest(AuthValidation.createVerifyEmailZodSchema),
  AuthController.verifyEmail
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.createResetPasswordZodSchema),
  AuthController.resetPassword
);

router.post(
  '/change-password',
  auth(USER_ROLES.AGENCY, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  validateRequest(AuthValidation.createChangePasswordZodSchema),
  AuthController.changePassword
);

// get single user
router.get("/user-details",
  auth(USER_ROLES.AGENCY, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  AuthController.getSingleUser
)
// resend otp
router.post("/resend-otp",
  AuthController.resendOtp
)



router.delete(
  '/public/delete-user',
  AuthController.deleteUserByEmailAndPassword
)
router.delete(
  '/delete-user',
  auth(USER_ROLES.AGENCY, USER_ROLES.USER),
  AuthController.deleteUser
);



export const AuthRoutes = router;
