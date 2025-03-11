import express, { NextFunction, Request, Response } from 'express';
import { BrandController } from './brand.controller';
import validateRequest from '../../middlewares/validateRequest';
import { BrandValidations } from './brand.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';

const router = express.Router();


/**
 * create brand route
*/
router.post(
    '/brands',
    fileUploadHandler() as any, // Multer middleware
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            if (!req.files || !(req.files as { [fieldname: string]: Express.Multer.File[] })['logo']) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "No logo file uploaded"
                })
            }

            const payload = req.body;
            // @ts-ignore
            const logo = getSingleFilePath(req.files, 'logo');

            req.body = {
                ...payload,
                logo,
            };

            next();
        } catch (error) {
            sendResponse(res, {
                statusCode: 403,
                success: false,
                message: "Can't create Brand"
            })
        }
    },
    validateRequest(BrandValidations.brandValidationSchema),
    BrandController.createBrand
);
// get all Brands
router.get('/brands', BrandController.getAllBrand);
// get single brand
router.get('/brands/:id', BrandController.getSingleBrand);
// update brand details
router.patch(
    '/brands/:id',
    fileUploadHandler() as any,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload = req.body;
            const logoFile = (req.files as { [fieldname: string]: Express.Multer.File[] })?.logo;
            if (logoFile) {
                // @ts-ignore
                payload.logo = getSingleFilePath(req.files, 'logo');
            }

            req.body = payload;
            next();
        } catch (error) {
            next(error);
        }
    },
    BrandController.updateSingleBrand
);

router.delete('/brands/:id', BrandController.deleteSingleBrand);

export const BrandRoutes = router;
