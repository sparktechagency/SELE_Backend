import { Request, Response, NextFunction } from 'express';
import { AboutServices } from './about.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createAbout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { ...aboutData } = req.body;
    const result = await AboutServices.createAboutToDB(aboutData)
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "About created successfully",
        data: result
    })
})

const getAbout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AboutServices.getAboutFromDB()
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "About fetched successfully",
        data: result
    })
})

export const AboutController = { createAbout, getAbout };
