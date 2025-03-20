import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IReserveDetails } from "./reservedetails.interface";
import { ReserveDetailsModel } from "./reservedetails.model";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../../types/pagination";

// create reserve Data

const createReserveDetails = async (payload: IReserveDetails) => {
    const reserveData = await ReserveDetailsModel.create(payload)
    if (!reserveData) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Can't create Reserve Details")
    }
    return reserveData
}

// get all reserve data
const getAllReserveData = async (options: IPaginationOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
    const data = await ReserveDetailsModel.find()
        .skip(skip)
        .limit(limit)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .populate('carId');
    const totalRecords = await ReserveDetailsModel.countDocuments();
    if (data.length === 0) {
        return []
    }
    return {
        data,
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
    }
}


const getSingleReserveData = async (id: string) => {
    const data = await ReserveDetailsModel.findById(id)
    if (!data) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No Reserve Data found")
    }
    return data
}
// Update Reserve Details
const updateReserveDetails = async (id: string, payload: IReserveDetails) => {
    const updatedData = await ReserveDetailsModel.findByIdAndUpdate(id, payload, { new: true });
    if (!updatedData) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update Reserve Details");
    }
    return updatedData;
};

// Delete Reserve Details
const deleteReserveDetails = async (id: string) => {
    const deletedData = await ReserveDetailsModel.findByIdAndDelete(id);
    if (!deletedData) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete Reserve Details");
    }
    return deletedData;
};


export const ReserveDetailsServices = {
    createReserveDetails,
    getAllReserveData,
    getSingleReserveData,
    updateReserveDetails,
    deleteReserveDetails
};
