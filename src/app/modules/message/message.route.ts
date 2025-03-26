import express from 'express';
import { MessageController } from './message.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.post('/', fileUploadHandler(), MessageController.sendMessage);
router.get('/:id', MessageController.getMessage);

export const MessageRoutes = router;
