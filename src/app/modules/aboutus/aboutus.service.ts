import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IAboutus } from './aboutus.interface';
import { AboutusModel } from './aboutus.model';

const createAboutUs = async (payload: IAboutus) => {
    const data = await AboutusModel.create(payload)
    if (!data) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Can't create About us")
    }
    return data
}


const updateAboutUs = async (id: string, updateData: IAboutus) => {
    const data = await AboutusModel.findById(id)
    if (!data) {
        throw new ApiError(StatusCodes.NOT_FOUND, "About Us data not found");
    }
    Object.assign(data, updateData)
    await data.save();

    return data;
}

export const AboutusServices = {
    createAboutUs,
    updateAboutUs
};
