import { Request, Response, NextFunction } from 'express';
import { PrivacyandpolicyServices } from './privacyandpolicy.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createPrivacyandpolicy = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { description } = req.body;
    const result = await PrivacyandpolicyServices.createPrivacyandpolicy(description);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Privacy and policy created successfully",
        data: result
    })
})

const getPrivacyandpolicy = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await PrivacyandpolicyServices.getPrivacyandpolicy();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Privacy and policy fetched successfully",
        data: result
    })
})

export const PrivacyandpolicyController = { createPrivacyandpolicy, getPrivacyandpolicy };
