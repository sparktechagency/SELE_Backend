import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import ApiError from '../../../errors/ApiError';
import { USER_ROLES } from '../../../enums/user';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { role, ...userData } = req.body;
    const adminApproval = role === USER_ROLES.AGENCY ? true : false;
    const result = await UserService.createUserToDB(role,{ ...userData, adminApproval });
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'User created successfully',
      data: result,
    });
  }
);

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');

    const data = {
      image,
      ...req.body,
    };
    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);


//otp verification
const verifyUserOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const user = req.user;
  if (!email || !otp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email and OTP are required');
  }
  const isVerified = await UserService.verifyOTPIntoDB(email, otp);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User verified successfully',
    data: { verified: isVerified },
  });
});


const userApproval = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.adminApprovalUserIntoDB(req.user, id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User approved successfully',
    data: result,
  });
});


const unApproveUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.upApprovedFromDB(req.user.id, req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User unapproved successfully',
    data: result,
  });
});


export const UserController = { createUser, getUserProfile, updateProfile, verifyUserOTP, userApproval, unApproveUser };
