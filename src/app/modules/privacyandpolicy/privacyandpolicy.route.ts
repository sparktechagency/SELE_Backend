import express from 'express';
import { PrivacyandpolicyController } from './privacyandpolicy.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { PrivacyandpolicyValidations } from './privacyandpolicy.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN), validateRequest(PrivacyandpolicyValidations.createPrivacyandpolicyZodSchema), PrivacyandpolicyController.createPrivacyandpolicy);
router.get('/', auth(USER_ROLES.SUPER_ADMIN), PrivacyandpolicyController.getPrivacyandpolicy);

export const PrivacyAndPolicyRoutes = router;
