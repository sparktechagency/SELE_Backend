import { ITermsAndConditions } from "./termsandconditions.interface";
import { termsAndConditions } from "./termsandconditions.model";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";



const createTermsAndConditions = async (payload: ITermsAndConditions) => {
    await termsAndConditions.deleteMany({})
    const result = await termsAndConditions.create(payload)
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create terms and conditions")
    }
    return result
}

const getTermsAndConditions = async () => {
    const result = await termsAndConditions.findOne({})
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Terms and conditions not found")
    }
    return result
}


export const termsAndConditionsServices = { createTermsAndConditions, getTermsAndConditions };
