import express, { NextFunction, Request, Response } from 'express';
import { CarsController } from './cars.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CarsValidations } from './cars.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import sendResponse from '../../../shared/sendResponse';
import { getSingleFilePath } from '../../../shared/getFilePath';

const router = express.Router();
// auth agency
router.post(
    '/',
    fileUploadHandler(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(req.files, "Uploaded files"); // Log uploaded files
            console.log(req.body, "Request body"); // Log form-data fields

            if (!req.files || !(req.files as { [fieldname: string]: Express.Multer.File[] })['carImage']) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: 'No car image uploaded',
                });
            }
            // @ts-ignore
            const carImage = getSingleFilePath(req.files, 'carImage');

            if (!carImage) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "Car image path is not defined",
                });
            }

            req.body = {
                ...req.body,
                carImage,
            };

            next();
        } catch (error) {
            console.error(error);
            sendResponse(res, {
                statusCode: 500,
                success: false,
                message: 'Error while uploading car image',
            });
        }
    },
    validateRequest(CarsValidations.CarsValidationSchema),
    CarsController.createCar
);


router.get('/', CarsController.getAllCars);
router.get('/:id', CarsController.getSingleCar);
router.patch('/:id', CarsController.updateCar);
router.delete('/:id', CarsController.deleteCar);



export const CarsRoutes = router;
