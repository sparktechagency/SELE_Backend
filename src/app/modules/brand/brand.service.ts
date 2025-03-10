import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IBrand } from './brand.interface';
import { BrandModel } from './brand.model';

// Create brand
const createBrandIntoDB = async (payload: IBrand) => {
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
const updateSingleBrandInDB = async (id: string, updateData: IBrand) => {
    const updatedBrand = await BrandModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedBrand) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Brand update failed");
    }
    return updatedBrand;
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
