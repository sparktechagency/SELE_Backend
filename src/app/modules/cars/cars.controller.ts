import { Request, Response, NextFunction } from 'express';
import { CarsServices } from './cars.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';


const createCar = catchAsync(async (req: Request, res: Response) => {
    const result = req.body;
    const data = await CarsServices.createCarIntoDB(result);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Car created successfully',
        data: data,
    })
})
const getAllCars = catchAsync(async (req: Request, res: Response) => {
    const result = await CarsServices.getAllCarsFromDB();
    sendResponse(res, {
        statusCode: 200,
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
