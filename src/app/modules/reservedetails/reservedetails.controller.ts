import { Request, Response, NextFunction } from 'express';
import { ReserveDetailsServices } from './reservedetails.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const createReserveDetails = catchAsync(async (req: Request, res: Response) => {
    const user = req.user.id
    const data = req.body
    const result = await ReserveDetailsServices.createReserveDetails(data, user)
    console.log("result from controller", result);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Successfully create Reserve Details",
        data: result
    })
})


const getAllReserveDetails = catchAsync(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder, progressStatus } = req.query;
    const options = {
        page: Number(page) || 1, 
        limit: Number(limit) || 10, 
        sortBy: sortBy || 'createdAt', 
        sortOrder: sortOrder || 'desc', 
        progressStatus: progressStatus
    };

    // Log the final options passed to the service

    // @ts-ignore
    const result = await ReserveDetailsServices.getAllReserveData(options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully retrieved all reserve details",
        // @ts-ignore
        data: result.data,
        // @ts-ignore
        pagination: result.pagination,
    });
});





const getSingleReserveDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await (await ReserveDetailsServices.getSingleReserveData(id)).populate('carId')
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully Retrieve Details",
        data: result
    })
})


const updateReserveDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { progressStatus } = req.body;

    if (!progressStatus) {
        return sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Progress status is required"
        });
    }

    const result = await ReserveDetailsServices.updateReserveDetails(id, progressStatus);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully Update Reserve Details",
        data: result
    });
});


const deleteReserveDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const deleteData = await ReserveDetailsServices.deleteReserveDetails(id)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully Delete Reserve Details",
        data: deleteData
    })
})
export const ReserveDetailsController = {
    createReserveDetails,
    getAllReserveDetails,
    getSingleReserveDetails,
    updateReserveDetails,
    deleteReserveDetails
};