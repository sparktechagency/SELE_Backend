import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { NotificationServices } from './notification.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
const createNotification = catchAsync(async (req: Request, res: Response) => {
  const notification = req.body;
  const result = await NotificationServices.createNotification(notification);
  console.log('result', result);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Notification created successfully',
    data: result,
  });
});

const getNotificationsByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const notifications = await NotificationServices.getNotificationsByUserId(
      userId
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Notifications fetched successfully',
      data: notifications,
    });
  }
);

const updateNotification = catchAsync(async (req: Request, res: Response) => {
  const { notificationId } = req.params;
  const userId = req.user?.id; // Use _id instead of id if using Mongoose

  console.log(
    `Attempting to update notification ${notificationId} for user ${userId}`
  ); // Debug log

  const result = await NotificationServices.updateNotification(
    notificationId,
    userId.toString()
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification marked as read',
    data: result,
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
  const { result: notifications, pagination } =
    await NotificationServices.getAllNotificationsIntoDB(paginationOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Notifications fetched successfully',
    data: notifications,
    // @ts-ignore
    pagination,
  });
});

export const NotificationController = {
  createNotification,
  getNotificationsByUserId,
  updateNotification,
  getAllNotifications,
};
