import { INotification } from './notification.interface';
import { Notification } from './notification.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../../types/pagination';

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

const updateNotification = async (notificationId: string) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};

const getAllNotificationsIntoDB = async (options: IPaginationOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

    // Get total count of notifications for pagination
    const total = await Notification.countDocuments();

    // Fetch the notifications with pagination
    const result = await Notification.find()
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 }) // Dynamic sort field and order
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
      }
    };
};


export const NotificationServices = {
  createNotification,
  getNotificationsByUserId,
  updateNotification,
  getAllNotificationsIntoDB,
};
