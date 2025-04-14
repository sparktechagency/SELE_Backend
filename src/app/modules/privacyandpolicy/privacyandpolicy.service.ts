import { IPrivacyAndPolicy } from './privacyandpolicy.interface';
import { PrivacyAndPolicy } from './privacyandpolicy.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const createPrivacyAndPolicyIntoDB = async (payload: IPrivacyAndPolicy) => {
    await PrivacyAndPolicy.deleteMany({});
    const result = await PrivacyAndPolicy.create(payload)
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create privacy and policy")
    }
    return result
}

const getPrivacyAndPolicy = async () => {
    const result = await PrivacyAndPolicy.findOne({});
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Privacy and policy not found");
    }
    return result;
}
export const PrivacyAndPolicyServices = {   createPrivacyAndPolicyIntoDB,  getPrivacyAndPolicy };
