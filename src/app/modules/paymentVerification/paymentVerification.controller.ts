import { StatusCodes } from 'http-status-codes';
import { stripe } from '../../../config/stripe';
import catchAsync from '../../../shared/catchAsync';
import { Request, Response } from 'express';
import { paymentVerificationModel } from './paymentVerification.model';
import { CarsModel } from '../cars/cars.model';
import ApiError from '../../../errors/ApiError';

const createCarPaymentSession = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const { amount, carId } = req.body;
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
              name: `Car Model - ${car.carModel}`
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:3000/success`,
      cancel_url: `http://localhost:3000/cancel`,
      metadata: { userId, carId },
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

export const paymentVerificationController = {
  createCarPaymentSession,
};
