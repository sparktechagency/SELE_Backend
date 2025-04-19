import { model, Schema } from 'mongoose';
import { IPaymentVerification } from './paymentVerification.interface';

const PaymentVerificationSchema = new Schema<IPaymentVerification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    checkoutSessionId: {
      type: String,
      required: true,
    },
    paymentUrl: {
      type: String,
      required: true,
    },
    trxId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['successful', 'failed', 'pending'],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    carId: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
  },
  { timestamps: true }
);

export const paymentVerificationModel = model<IPaymentVerification>(
  'paymentVerification',
  PaymentVerificationSchema
);
