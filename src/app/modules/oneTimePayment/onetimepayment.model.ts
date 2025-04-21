import { Schema, model } from 'mongoose';
import { IOneTimePayment } from './onetimepayment.interface';

const oneTimePaymentSchema = new Schema<IOneTimePayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amountPaid: { type: Number, required: true },
    trxId: { type: String },
    carDetails: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    userEmail: { type: String, required: true },
    postCode: { type: String, required: true },
    checkoutSessionId: { type: String, required: true },
    paymentUrl: { type: String, required: true },
    reservationId: { type: Schema.Types.ObjectId, ref: 'Reservedetails' },
  },
  { timestamps: true }
);

export const OneTimePayment = model<IOneTimePayment>(
  'OneTimePayment',
  oneTimePaymentSchema
);
