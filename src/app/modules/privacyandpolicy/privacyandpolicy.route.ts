import express from 'express';
import { PrivacyAndPolicyController } from './privacyandpolicy.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { PrivacyAndPolicyValidations } from './privacyandpolicy.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN), validateRequest(PrivacyAndPolicyValidations.createPrivacyAndPolicyZodSchema), PrivacyAndPolicyController.createPrivacyAndPolicy);
router.get('/',  PrivacyAndPolicyController.getPrivacyAndPolicy);

export const PrivacyAndPolicyRoutes = router;
