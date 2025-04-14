import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { NotificationServices } from "./notification.service";
import sendResponse from "../../../shared/sendResponse";
const createNotification = catchAsync(async (req: Request, res: Response) => {
    const notification = req.body;
    const result = await NotificationServices.createNotification(notification);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Notification created successfully",
        data: result
    });
});

const getNotificationsByUserId = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const notifications = await NotificationServices.getNotificationsByUserId(userId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Notifications fetched successfully",
        data: notifications
    });
});

const updateNotification = catchAsync(async (req: Request, res: Response) => {
    const { notificationId } = req.params;
    const result = await NotificationServices.updateNotification(notificationId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Notification updated successfully",
        data: result
    });
});


const getAllNotifications = catchAsync(async (req: Request, res: Response) => {
    const paginationOptions: any = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc',
    };

    // Call the service to get paginated notifications
    const { result: notifications, pagination } = await NotificationServices.getAllNotificationsIntoDB(paginationOptions);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Notifications fetched successfully",
        data: notifications,
        pagination
    });
});




export const NotificationController = {
    createNotification,
    getNotificationsByUserId,
    updateNotification,
    getAllNotifications
}



