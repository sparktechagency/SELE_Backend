import express, { NextFunction, Request, Response } from 'express';
import { CarsController } from './cars.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CarsValidations } from './cars.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import sendResponse from '../../../shared/sendResponse';
import { getSingleFilePath } from '../../../shared/getFilePath';

const router = express.Router();
// auth agency
router.post('/',
    fileUploadHandler() as any, // File upload handler first to ensure file is added
    validateRequest(CarsValidations.CarsValidationSchema), // Validation happens after file is uploaded
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if file is uploaded
            if (!req.files || !(req.files as { [fieldname: string]: Express.Multer.File[] })['car']) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "No car image uploaded"
                });
            }

            const payload = req.body;
            console.log(payload);
            // Handle file upload, and assign file path to payload
            // @ts-ignore
            const carImage = getSingleFilePath(req.files, 'car'); // Make sure the field name matches

            req.body = {
                ...payload,
                carImage, // Add file path to request body
            };

            next(); // Continue to the controller
        } catch (error) {
            sendResponse(res, {
                statusCode: 403,
                success: false,
                message: "Error while creating car"
            });
        }
    },
    CarsController.createCar // Proceed to controller
);

router.get('/', CarsController.getAllCars);
router.get('/:id', CarsController.getSingleCar);
router.patch('/:id', CarsController.updateCar);
router.delete('/:id', CarsController.deleteCar);



export const CarsRoutes = router;
