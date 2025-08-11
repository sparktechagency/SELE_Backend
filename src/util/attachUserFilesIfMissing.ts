import { NextFunction, Request, Response } from "express";
import { User } from "../app/modules/user/user.model";
import sendResponse from "../shared/sendResponse";

const attachUserFilesIfMissing = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id;
        const user = await User.findById(userId);
        req.body = {
            ...req.body,
            user,
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