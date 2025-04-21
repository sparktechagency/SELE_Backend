import { Types } from 'mongoose';

export interface IPaymentVerification {
  userId: Types.ObjectId;
  transactionId?: string;
  amount: number;
  currency?: string;
  status?: 'successful' | 'failed'|'pending';
  checkoutSessionId?: string;
  paymentUrl?: string;
  trxId?: string;
  carId:Types.ObjectId;
  reserveId:Types.ObjectId;
}
