import { Request, Response, NextFunction } from 'express';
import { ReservedetailsServices } from './reservedetails.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const createReserveDetails = catchAsync(async (req: Request, res: Response) => {
    const data = req.body
    const result = await ReservedetailsServices.createReserveDetails(data)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully create Reserve Details",
        data: result
    })
})


const getAllReserveDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await ReservedetailsServices.getAllReserveData()
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully Retrieve all Details",
        data: result
    })
})



const getSingleReserDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await ReservedetailsServices.getSingleReserveData(id)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully Retrieve Details",
        data: result
    })
})


const updateReserDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body
    const result = await ReservedetailsServices.updateReserveDetails(id, data);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully Update Reserve Details",
        data: result
    })
})

const deleteReserveDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const deleteData = await ReservedetailsServices.deleteReserveDetails(id)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully Delete Reserve Details",
        data: deleteData
    })
})


export const ReservedetailsController = {
    createReserveDetails,
    getAllReserveDetails,
    getSingleReserDetails,
    updateReserDetails,
    deleteReserveDetails
};
