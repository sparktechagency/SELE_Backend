import { INotification } from './notification.interface';
import { Notification } from './notification.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';

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

const getAllNotificationsIntoDB = async (
  query: Record<string, any>,
  user: JwtPayload
) => {
  const queryBuilder = new QueryBuilder(
    Notification.find({ receiver: user.id }),
    query
  );
  const result = await queryBuilder.modelQuery;
  const meta = await queryBuilder.getPaginationInfo();

  return { data: result, meta };
};

export const NotificationServices = {
  createNotification,
  getNotificationsByUserId,
  updateNotification,
  getAllNotificationsIntoDB,
};
