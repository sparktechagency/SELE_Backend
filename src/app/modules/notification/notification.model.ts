import { Schema, model } from 'mongoose';
import { INotification } from './notification.interface';

const notificationSchema = new Schema<INotification>({
  userId: { type: String, required: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  filePath: { type: String, enum: ['conversion', 'reservation', 'allOrder'] },
  isRead: { type: Boolean, default: false },
  reserVationId: { type: Schema.Types.ObjectId, ref: 'Reservedetails' },
  conversionId: { type: Schema.Types.ObjectId, ref: 'Message' },
},{
    timestamps:true
});

export const Notification = model<INotification>(
  'Notification',
  notificationSchema
);
