import { PrivacyAndPolicyModel } from './privacyandpolicy.interface';
import { Privacyandpolicy } from './privacyandpolicy.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const createPrivacyandpolicy = async (payload: PrivacyAndPolicyModel) => {
    await Privacyandpolicy.deleteMany({});
    const result = await Privacyandpolicy.create(payload);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create privacy and policy");
    }
    return result;
}

const getPrivacyandpolicy = async () => {
    const result = await Privacyandpolicy.findOne({});
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Privacy and policy not found");
    }
    return result;
}
export const PrivacyandpolicyServices = { createPrivacyandpolicy, getPrivacyandpolicy };
