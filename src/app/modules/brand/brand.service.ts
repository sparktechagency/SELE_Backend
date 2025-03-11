import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IBrand } from './brand.interface';
import { BrandModel } from './brand.model';
import fs from 'fs';
import path from 'path';

// Create brand
const createBrandIntoDB = async (payload: IBrand) => {

    if (!payload.logo) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Logo is required");
    }

    const brand = await BrandModel.create(payload);
    if (!brand) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Can't create brand");
    }
    return brand;
};

// Get all brands
const getAllBrandFromDB = async () => {
    const brands = await BrandModel.find();
    if (brands.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No brands found");
    }
    return brands;
};

// Get a single brand by ID
const getSingleBrandFromDB = async (id: string) => {
    const brand = await BrandModel.findById(id);
    if (!brand) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Brand not found");
    }
    return brand;
};

// Update a single brand by ID
const updateSingleBrandInDB = async (id: string, updateData: Partial<IBrand>) => {
    const existingBrand = await BrandModel.findById(id);
    if (!existingBrand) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Brand not found");
    }

    if (updateData.logo && existingBrand.logo) {
        try {
            fs.unlinkSync(path.join(process.cwd(), existingBrand.logo));
        } catch (err) {
            console.error("Error deleting old logo:", err);
        }
    }

    Object.assign(existingBrand, updateData);
    await existingBrand.save();

    return existingBrand;
};



// Delete a single brand by ID (Permanent Deletion)
const deleteSingleBrandFromDB = async (id: string) => {
    const brandId = await BrandModel.findByIdAndDelete(id);
    if (!brandId) {
        throw new ApiError(StatusCodes.BAD_GATEWAY, "Brand not found");
    }
    return brandId;
};




export const BrandServices = {
    createBrandIntoDB,
    getAllBrandFromDB,
    getSingleBrandFromDB,
    updateSingleBrandInDB,
    deleteSingleBrandFromDB
};
