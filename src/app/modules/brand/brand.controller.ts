import { Request, Response, NextFunction } from 'express';
import { BrandServices } from './brand.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

// Create a brand
const createBrand = catchAsync(async (req: Request, res: Response) => {
    const brandData = req.body;  // Get data from the request body
    const createdBrand = await BrandServices.createBrandIntoDB(brandData);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully created brand",
        data: createdBrand
    });
});

// Get all brands
const getAllBrand = catchAsync(async (req: Request, res: Response) => {
    const result = await BrandServices.getAllBrandFromDB();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully fetched all brands",
        data: result
    });
});

// Get a single brand by ID
const getSingleBrand = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const brandData = await BrandServices.getSingleBrandFromDB(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully fetched brand",
        data: brandData
    });
});

// Update a brand by ID
const updateSingleBrand = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    const updatedBrand = await BrandServices.updateSingleBrandInDB(id, updateData);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully updated brand",
        data: updatedBrand
    });
});

// Delete a single brand by ID (Permanent Deletion)
const deleteSingleBrand = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedBrand = await BrandServices.deleteSingleBrandFromDB(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully deleted brand",
        data: deletedBrand
    });
});

export const BrandController = {
    createBrand,
    getAllBrand,
    getSingleBrand,
    updateSingleBrand,
    deleteSingleBrand
};
