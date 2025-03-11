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

// get all
router.get('/', CarsController.getAllCars);
// get single one
router.get('/:id', CarsController.getSingleCar);
// update one
router.patch(
    '/:id',
    fileUploadHandler(), // Middleware to handle the file upload
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.files && (req.files as { [fieldname: string]: Express.Multer.File[] })['carImage']) {
                // @ts-ignore
                const carImage = getSingleFilePath(req.files, 'carImage');

                if (!carImage) {
                    return sendResponse(res, {
                        statusCode: 400,
                        success: false,
                        message: "Car image path is not defined",
                    });
                }

                // Add the new car image to the request body
                req.body.carImage = carImage;
            }

            next();
        } catch (error) {
            sendResponse(res, {
                statusCode: 500,
                success: false,
                message: 'Error while uploading car image',
            });
        }
    },
    CarsController.updateCar
);


// delete one
router.delete('/:id', CarsController.deleteCar);



export const CarsRoutes = router;
