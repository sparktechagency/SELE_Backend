import { Request, Response, NextFunction } from 'express';
import { CarsServices } from './cars.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';


const createCar = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;  // Extract the userId from the authenticated user
    if (!userId) {
        return sendResponse(res, {
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: 'User not authenticated',
        });
    }

    const carData = req.body;

    try {
        // Create the car in the DB using the service function
        const createdCar = await CarsServices.createCarIntoDB(carData, userId);

        // Return a success response
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Car created successfully',
            data: createdCar,
        });
    } catch (error) {
        // Handle errors in case the service throws an error
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: 'Failed to create car',
        });
    }
});


const getAllCars = catchAsync(async (req: Request, res: Response) => {
    const filter = req.query
    const result = await CarsServices.getAllCarsFromDB(filter);
    sendResponse(res, {
        statusCode: 200,
        totalLength: result.length,
        success: true,
        message: 'Cars fetched successfully',
        data: result,
    })
})


const getSingleCar = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CarsServices.getSingleCarFromDB(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Car fetched successfully',
        data: result,
    })
})

const updateCar = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = req.body;
    const data = await CarsServices.updateCarIntoDB(id, result);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Car updated successfully',
        data: data,
    })
})

const deleteCar = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CarsServices.deleteCarFromDB(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Car deleted successfully',
        data: result,
    })
})


export const CarsController = {
    createCar,
    getAllCars,
    getSingleCar,
    updateCar,
    deleteCar,
};
