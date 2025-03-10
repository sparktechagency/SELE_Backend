import express from 'express';
import { BrandController } from './brand.controller';
import validateRequest from '../../middlewares/validateRequest';
import { BrandValidations } from './brand.validation';

const router = express.Router();

router.post('/brands', validateRequest(BrandValidations.brandValidationSchema), BrandController.createBrand);
router.get('/brands', BrandController.getAllBrand);
router.get('/brands/:id', BrandController.getSingleBrand);
router.put('/brands/:id', BrandController.updateSingleBrand);
router.delete('/brands/:id', BrandController.deleteSingleBrand);

export const BrandRoutes = router;
