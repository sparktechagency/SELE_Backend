import ApiError from '../../../errors/ApiError';
import { AboutModel, IAbout } from './about.interface';
import { About } from './about.model';
import { StatusCodes } from 'http-status-codes';

const createAboutToDB = async (payload: IAbout) => {
    await About.deleteMany({});
    const result = await About.create(payload);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create about");
    }

    return result;
}

const getAboutFromDB = async () => {
    const result = await About.findOne({})
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "About not found")
    }
    return result
}


export const AboutServices = {
    createAboutToDB,
    getAboutFromDB
};
