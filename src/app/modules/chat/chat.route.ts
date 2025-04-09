import express from 'express';
import { ChatController } from './chat.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post('/',auth(USER_ROLES.USER), ChatController.createChat);
router.get('/',auth(USER_ROLES.AGENCY, USER_ROLES.USER), ChatController.getChat);

export const ChatRoutes = router;
