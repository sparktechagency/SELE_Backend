import { Schema, model } from 'mongoose';
import { INotification } from './notification.interface';

const notificationSchema = new Schema<INotification>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  filePath: { type: String, enum: ['conversion', 'reservation', 'allOrder'] },
  isRead: { type: Boolean, default: false },
},{
    timestamps:true
});

export const Notification = model<INotification>(
  'Notification',
  notificationSchema
);
