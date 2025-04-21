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


// get single user

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getSingleUserFromDB(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User fetched successfully',
    data: result,
  });
});

// delete user 
const deleteUserFromDB = catchAsync(async(req:Request, res:Response)=>{
  const result = await DashboardService.deleteUserFromDB(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
})

// Todo: app charge and payment history
const totalEarning = catchAsync(async(req:Request, res:Response)=>{
  const result = await DashboardService.totalEarningFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Earning fetched successfully',
    data: result,
  });
})
// agency
const totalAgency = catchAsync(async(req:Request, res:Response)=>{
  const result = await DashboardService.totalAgency(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Agency fetched successfully',
    data: result.data,
  }); 
})

// single agency
const getSingleAgency = catchAsync(async(req:Request, res:Response)=>{
  const result = await DashboardService.getSingleAgencyFromDB(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Agency fetched successfully',
    data: result,
  });
})
// delete agency
const deleteAgencyFromDB = catchAsync(async(req:Request, res:Response)=>{
  const result = await DashboardService.deleteAgencyFromDB(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Agency deleted successfully',
    data: result,
  });
})

export const DashboardController = {
  getDashboardStatistics,
  getRecentUserForDashboard,
  getAllUsers,
  getSingleUser,
  deleteUserFromDB,
  totalAgency,
  getSingleAgency,
  deleteAgencyFromDB,
  totalEarning
};
