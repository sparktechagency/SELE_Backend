import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IReserveDetails } from "./reservedetails.interface";
import { ReserveDetailsModel } from "./reservedetails.model";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../../types/pagination";
import { Server } from "socket.io";
import { sendNotifications } from "../../../helpers/notificationSender";

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
    const { page, limit, skip, sortBy, sortOrder, progressStatus } = paginationHelper.calculatePagination(options);

    // Log the progressStatus value to check if it's passed correctly
    console.log('Progress Status received in service:', progressStatus);

    // Initialize the filter object
    const filter: any = {};

    // Apply filter for progressStatus if it's provided
    if (progressStatus) {
        filter.progressStatus = progressStatus;
    }

    // Log the final filter before querying
    console.log('Filter being used in the query:', filter);

    const data = await ReserveDetailsModel.find(filter) // Apply the filter to the query
        .skip(skip)
        .limit(limit)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .populate('carId');

    const totalRecords = await ReserveDetailsModel.countDocuments(filter);

    // Log the fetched data
    console.log('Fetched Data:', data);

    if (data.length === 0) {
        return {
            data: [],
            page,
            limit,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
        };
    }

    return {
        data,
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
    };
};






const getSingleReserveData = async (id: string) => {
    const data = await ReserveDetailsModel.findById(id)
    if (!data) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No Reserve Data found")
    }
    return data
}
// Update Reserve Details
const updateReserveDetails = async (id: string, progressStatus: string) => {
    const updatedData: any = await ReserveDetailsModel.findByIdAndUpdate(id, { progressStatus }, { new: true });
    if (!updatedData) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update Reserve Details");
    }
    const notificationPayload = {
        userId: updatedData?._id,
        title: "Reserve Details In Progress",
        message: `Your reserve details are in ${progressStatus}`,
        type: "reserve_details"
    }

    await sendNotifications(notificationPayload as any);
    return updatedData;
}

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
