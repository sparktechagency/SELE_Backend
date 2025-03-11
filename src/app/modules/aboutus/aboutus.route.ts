import express from 'express';
import { AboutusController } from './aboutus.controller';

const router = express.Router();

router.post('/', AboutusController.createAboutUs);
router.patch('/:id', AboutusController.updateAboutUs);

export const AboutusRoutes = router;
