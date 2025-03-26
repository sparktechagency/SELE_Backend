import { Request, Response, NextFunction } from 'express';
import { termsAndConditionsServices } from './termsandconditions.service';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';

const createTermsAndConditions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { description } = req.body
    const result = await termsAndConditionsServices.createTermsAndConditions({ description })
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Terms and conditions created successfully",
        data: result
    })
})

const getTermsAndConditions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await termsAndConditionsServices.getTermsAndConditions()
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Terms and conditions fetched successfully",
        data: result
    })
})


export const termsAndConditionsController = { createTermsAndConditions, getTermsAndConditions };
