import express from 'express';
import { AboutController } from './about.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { AboutValidations } from './about.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN), validateRequest(AboutValidations.createAboutZodSchema), AboutController.createAbout);
router.get('/',  AboutController.getAbout);

export const AboutRoutes = router;
