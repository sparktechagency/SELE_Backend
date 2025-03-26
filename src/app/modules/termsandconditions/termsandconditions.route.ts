import express from 'express';
import { termsAndConditionsController } from './termsandconditions.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { termsAndConditionsValidations } from './termsandconditions.validation';
const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN), validateRequest(termsAndConditionsValidations.createTermsAndConditionsZodSchema), termsAndConditionsController.createTermsAndConditions);
router.get('/', auth(USER_ROLES.SUPER_ADMIN), termsAndConditionsController.getTermsAndConditions);

export const termsAndConditionsRoutes = router;
