import { Request, Response, NextFunction } from 'express';
import { ReserveDetailsServices } from './reservedetails.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const createReserveDetails = catchAsync(async (req: Request, res: Response) => {
    const data = req.body
    const result = await ReserveDetailsServices.createReserveDetails(data)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Successfully create Reserve Details",
        data: result
    })
})


const getAllReserveDetails = catchAsync(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = req.query;
    const options = {
        page: Number(page) || 1, // Default to page 1 if not provided
        limit: Number(limit) || 10, // Default to 10 records per page if not provided
        sortBy: sortBy || 'createdAt', // Default sort by 'createdAt' field
        sortOrder: sortOrder || 'desc', // Default sort order 'desc'
    };
    // @ts-ignore
    const result = await ReserveDetailsServices.getAllReserveData(options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully retrieved all reserve details",
        // @ts-ignore
        data: result.data,
        pagination: {
            // @ts-ignore
            page: result.page,
            // @ts-ignore
            limit: result.limit,
            // @ts-ignore
            totalRecords: result.totalRecords,
            // @ts-ignore
            totalPages: result.totalPages,
        }

    })


})
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