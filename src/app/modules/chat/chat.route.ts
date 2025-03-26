import express from 'express';
import { ChatController } from './chat.controller';

const router = express.Router();

router.post('/', ChatController.createChat);
router.get('/', ChatController.getChat);

export const ChatRoutes = router;
