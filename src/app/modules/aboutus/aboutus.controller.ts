import { Request, Response, NextFunction } from 'express';
import { AboutusServices } from './aboutus.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';


const createAboutUs = catchAsync(async (req: Request, res: Response) => {
    const data = req.body
    const result = await AboutusServices.createAboutUs(data)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully create About us",
        data: result
    })
})


const updateAboutUs = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    const result = await AboutusServices.updateAboutUs(id, updateData)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Update successfully",
        data: result
    })
})


export const AboutusController = {
    createAboutUs,
    updateAboutUs
};
