import { StatusCodes } from 'http-status-codes';
import { stripe } from '../../../config/stripe';
import catchAsync from '../../../shared/catchAsync';
import { Request, Response } from 'express';
import { paymentVerificationModel } from './paymentVerification.model';
import { CarsModel } from '../cars/cars.model';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';

const createCarPaymentSession = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const { amount, carId, reserveId } = req.body;
    const car = await CarsModel.findById(carId);
    if (!car) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Car not found');
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Car Model - ${car.carModel}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:3000/success`,
      cancel_url: `http://localhost:3000/cancel`,
      metadata: { userId, carId, reserveId },
    });

    // Only save successful payments
    const payment = new paymentVerificationModel({
      userId,
      carId,
      transactionId: session.id,
      amount,
      currency: 'usd',
      status: 'pending',
      checkoutSessionId: session.id,
      paymentUrl: session.url || '',
      trxId: null,
      reserveId,
    });
    await payment.save();
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Payment session created successfully',
      data: {
        sessionId: session.id,
        paymentUrl: session.url,
        trxId: session.payment_intent,
      },
    });
  }
);

const createAccountIntoStripe = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const existingUser: any = await User.findById(userId).lean();
    if (existingUser.accountUrl) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }
    // @ts-ignore
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: existingUser.email,
      business_type: 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      individual: {
        first_name: existingUser.name,
        email: existingUser.email,
      },
      business_profile: {
        mcc: 7299,
        product_description: 'Car rental services',
        url: 'https://yourplatform.com',
      },
    });
    if (!account) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found');
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'https://10.0.70.188:5003/onboarding-refresh', 
      return_url: 'https://10.0.70.188:5003/onboarding-success', 
      type: 'account_onboarding',
    });
    const updateAccount = await User.findByIdAndUpdate(
      userId,
      { 'accountInformation.stripeAccountId': account.id },
      { new: true }
    );
    if (!updateAccount) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to update account');
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Account link created successfully',
      data: {
        accountLinkUrl: accountLink?.url,
      },
    });
  }
);

export const paymentVerificationController = {
  createCarPaymentSession,
  createAccountIntoStripe,
};
