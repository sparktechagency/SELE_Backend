import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IReservedetails } from "./reservedetails.interface";
import { ReservedetailsModel } from "./reservedetails.model";

// create reserve Data

const createReserveDetails = async (payload: IReservedetails) => {
    const reserveData = await ReservedetailsModel.create(payload)
    if (!reserveData) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Can't create Reserve Details")
    }
    return reserveData
}

// get all reserve data
const getAllReserveData = async () => {
    const data = await ReservedetailsModel.find()
    if (data.length === 0) {
        return []
    }
    return data
}


const getSingleReserveData = async (id: string) => {
    const data = await ReservedetailsModel.findById(id)
    if (!data) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No Reserve Data found")
    }
    return data
}
// Update Reserve Details
const updateReserveDetails = async (id: string, payload: IReservedetails) => {
    const updatedData = await ReservedetailsModel.findByIdAndUpdate(id, payload, { new: true });
    if (!updatedData) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update Reserve Details");
    }
    return updatedData;
};

// Delete Reserve Details
const deleteReserveDetails = async (id: string) => {
    const deletedData = await ReservedetailsModel.findByIdAndDelete(id);
    if (!deletedData) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete Reserve Details");
    }
    return deletedData;
};


export const ReservedetailsServices = {
    createReserveDetails,
    getAllReserveData,
    getSingleReserveData,
    updateReserveDetails,
    deleteReserveDetails
};
