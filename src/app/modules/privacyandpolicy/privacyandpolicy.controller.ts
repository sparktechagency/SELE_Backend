import { Request, Response, NextFunction } from 'express';
import { PrivacyAndPolicyServices } from './privacyandpolicy.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createPrivacyAndPolicy = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { description } = req.body;
    const result = await PrivacyAndPolicyServices.createPrivacyAndPolicyIntoDB({description});
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Privacy and policy created successfully",
        data: result
    })
})

const getPrivacyAndPolicy = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await PrivacyAndPolicyServices.getPrivacyAndPolicy();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Privacy and policy fetched successfully",
        data: result
    })
})

export const PrivacyAndPolicyController = { createPrivacyAndPolicy,  getPrivacyAndPolicy };
