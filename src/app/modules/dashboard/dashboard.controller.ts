import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { DashboardService } from './dashboard.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { Request, Response } from 'express';

const getDashboardStatistics = catchAsync(
  async (req: Request, res: Response) => {
    const totalData = await DashboardService.dashboardStatisticsIntoDB();
    console.log(totalData);
    if (!totalData) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to get data');
    }
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Data fetched successfully',
      data: totalData,
    });
  }
);

// recent user
const getRecentUserForDashboard = catchAsync(
  async (req: Request, res: Response) => {
    const result = await DashboardService.getRecentUserForDashboard();
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Recent user not found');
    }
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Recent user fetched successfully',
      data: result,
    });
  }
);

// get user
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getAllUsers(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Users fetched successfully',
    data: result.data,
  });
});

export const DashboardController = {
  getDashboardStatistics,
  getRecentUserForDashboard,
  getAllUsers,
};
