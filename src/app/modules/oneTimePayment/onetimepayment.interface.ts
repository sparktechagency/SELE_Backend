import { Schema, Types } from 'mongoose';

export type IOneTimePayment = {
  user: Schema.Types.ObjectId;
  amountPaid?: number;
  trxId?: string;
  status: 'pending' | 'completed' | 'failed';
  userEmail: string;
  postCode: string;
  carDetails: Types.ObjectId;
  checkoutSessionId: string;
  paymentUrl: string;
  reservationId: Types.ObjectId;
};
