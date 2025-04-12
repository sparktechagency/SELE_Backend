import { Request, Response, NextFunction } from 'express';
import { CarsServices } from './cars.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createCar = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'User not authenticated',
    });
  }

  const carData = req.body;

  // Create the car in the DB using the service function
  const createdCar = await CarsServices.createCarIntoDB(carData, userId);

  // Return a success response
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Car created successfully',
    data: createdCar,
  });
});

const getAllCars = catchAsync(async (req: Request, res: Response) => {
  const filter: any = req.query;

  // Ensure the default values for pagination
  filter.page = filter.page || 1;
  filter.limit = filter.limit || 10;

  // Call the service with the filters
  const result = await CarsServices.getAllCarsFromDB(filter);

  // Pagination info calculation based on the result's length
  const pagination = {
    page: Number(filter.page),
    limit: Number(filter.limit),
    total: result.length, // You may want to calculate the total records here, or in the service
    totalPage: Math.ceil(result?.length / Number(filter?.limit)),
  };

  // Send the response with pagination data
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Cars fetched successfully',
    data: result, // The actual data
    pagination, // Pagination info
  });
});


const getSingleCar = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CarsServices.getSingleCarFromDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Car fetched successfully',
    data: result,
  });
});

const updateCar = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = req.body;
  const data = await CarsServices.updateCarIntoDB(id, result);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Car updated successfully',
    data: data,
  });
});

const deleteCar = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CarsServices.deleteCarFromDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Car deleted successfully',
    data: result,
  });
});

export const CarsController = {
  createCar,
  getAllCars,
  getSingleCar,
  updateCar,
  deleteCar,
};
