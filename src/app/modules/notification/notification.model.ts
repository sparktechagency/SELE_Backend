import { Schema, model } from 'mongoose';
import { INotification } from './notification.interface';

const notificationSchema = new Schema<INotification>({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  filePath: { type: String, enum: ['conversion', 'reservation', 'allOrder', 'user'] },
  isRead: { type: Boolean, default: false },
  referenceId: { type: Schema.Types.ObjectId },
}, {
  timestamps: true
});

export const Notification = model<INotification>(
  'Notification',
  notificationSchema
);
