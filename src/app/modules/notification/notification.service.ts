import { INotification } from "./notification.interface";
import { Notification } from "./notification.model";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

const createNotification = async (notification: INotification) => {
    const result = await Notification.create(notification)
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create notification")
    }
    return result
}

const getNotificationsByUserId = async (userId: string) => {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
};

const updateNotification = async (notificationId: string) => {
    return await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
    );
};

export const NotificationServices = {
    createNotification,
    getNotificationsByUserId,
    updateNotification
}




