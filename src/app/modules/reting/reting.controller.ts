import { Request, Response, NextFunction } from 'express';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { RatingServices } from './reting.service';

const createRating = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { ...payload } = req.body;
  const result = await RatingServices.createRatingIntoDB(payload, user);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Rating created successfully',
    data: result,
  });
});

const getAllRating = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = req.query;
  const result = await RatingServices.getAllRatingFromDB(paginationOptions);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All Rating fetched successfully',
    data: result,
  });
});

const getSingleRating = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await RatingServices.getSingleRatingFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Single Rating fetched successfully',
    data: result,
  });
});
const updateRating = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const payload = req.body;
  const result = await RatingServices.updateRatingIntoDB(id, payload);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Rating updated successfully',
    data: result,
  });
});
const deleteRating = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await RatingServices.deleteRatingFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Rating deleted successfully',
    data: result,
  });
});

export const RatingController = {
  createRating,
  getAllRating,
  getSingleRating,
  updateRating,
  deleteRating,
};
