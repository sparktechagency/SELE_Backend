import { Router } from 'express';
import { paymentVerificationController } from './paymentVerification.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const route = Router();

route.post('/',auth(USER_ROLES.USER, USER_ROLES.AGENCY), paymentVerificationController.createCarPaymentSession);
route.post('/create-account',auth(USER_ROLES.USER, USER_ROLES.AGENCY), paymentVerificationController.createAccountIntoStripe);

export const paymentVerificationRoutes = route;