import { NextFunction, Request, Response } from "express";
import { User } from "../app/modules/user/user.model";
import { getMultipleFilesPath } from "../shared/getFilePath";
import sendResponse from "../shared/sendResponse";

const attachUserFilesIfMissing = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id;
        const user = await User.findById(userId);

        // Get uploaded files or fallback to user's stored files
        const drivingLicense =
            getMultipleFilesPath(req.files, 'drivingLicense' as any) || user?.drivingLicense || [];

        const yourID =
            getMultipleFilesPath(req.files, 'yourID' as any) || user?.yourID || [];

        // Still missing? Return error
        if (!drivingLicense.length || !yourID.length) {
            return sendResponse(res, {
                statusCode: 400,
                success: false,
                message: 'Both drivingLicense and yourID are required',
            });
        }

        req.body = {
            ...req.body,
            drivingLicense,
            yourID,
        };

        next();
    } catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: 'Error while processing files',
        });
    }
};


export default attachUserFilesIfMissing