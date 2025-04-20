import { INotification } from './notification.interface';
import { Notification } from './notification.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../../types/pagination';
import { Types } from 'mongoose';

const createNotification = async (notification: INotification) => {
  const result = await Notification.create(notification);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create notification'
    );
  }
  return result;
};

const getNotificationsByUserId = async (userId: string) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

const updateNotification = async (notificationId: string, userId: string) => {
  // Use findOneAndUpdate instead of findByIdAndUpdate
  const notification = await Notification.findOneAndUpdate(
    {
      _id: new Types.ObjectId(notificationId),
      userId: new Types.ObjectId(userId),
    },
    { isRead: true },
    { new: true, runValidators: true }
  );

  if (!notification) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Notification not found or does not belong to you'
    );
  }

  return notification;
};

const getAllNotificationsIntoDB = async (options: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  // Get total count of notifications for pagination
  const total = await Notification.countDocuments();

  // Fetch the notifications with pagination
  const result = await Notification.find()
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to get all notifications'
    );
  }

  // Calculate total pages
  const totalPages = Math.ceil(total / limit);

  return {
    result,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const NotificationServices = {
  createNotification,
  getNotificationsByUserId,
  updateNotification,
  getAllNotificationsIntoDB,
};
