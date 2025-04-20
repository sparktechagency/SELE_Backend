import { Request, Response, NextFunction } from 'express';
import { stripe } from '../../../config/stripe';
import { OneTimePayment } from './onetimepayment.model';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';

const createOneTimePackage = async (req: Request, res: Response) => {
  const {
    products,
    userName,
    userEmail,
    country,
    city,
    streetAddress,
    postCode,
    orderMessage,
  } = req.body;

  // Find the user by email
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'User not found.',
    });
  }

  try {
    const lineItems = await Promise.all(
      products.map(async (product: any) => {
        const { productName, price, quantity, color, size, id } = product;

        // Log incoming price for each product
        const stripeProduct = await stripe.products.create({
          name: product.productName || `Product ${id}`,
          metadata: { productId: id, color, size },
        });

        // If the price is already in cents (e.g., 450), use it directly
        const unitAmount = price * 100;

        const priceObject = await stripe?.prices?.create({
          unit_amount: unitAmount,
          currency: 'usd',
          product: stripeProduct.id,
        });

        return {
          price: priceObject.id,
          quantity: quantity || 1,
        };
      })
    );
    const session = await stripe?.checkout?.sessions?.create({
      payment_method_types: ['card'],
      line_items: lineItems.map(item => ({
        price: item.price,
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: 'http://success:6009/payment/success',
      cancel_url: 'http://success:6009/payment/cancel',
    });

    // Stripe returns amount_total in cents
    const amountPaid = session.amount_total ?? 0;

    // Store only the productName for each product
    const paymentData = {
      user: user._id,
      status: 'completed',
      products: products.map((p: any) => ({
        id: p.id,
        name: p.productName || `Product ${p.id}`,
        price: p.price,
        quantity: p.quantity || 1,
      })),
      userName,
      userEmail,
      country,
      city,
      streetAddress,
      postCode,
      orderMessage,
      checkoutSessionId: session.id,
      paymentUrl: session.url,
      amountPaid,
    };

    const oneTimePayment = new OneTimePayment(paymentData);
    const confirmPayment = await oneTimePayment.save();

    if (!confirmPayment) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Failed to create payment.',
      });
    }
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Checkout session created successfully.',
      data: {
        sessionId: session.id,
        paymentUrl: session.url,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: `Error during the payment process: ${error}`,
    });
  }
};

export const OneTimePaymentController = {
  createOneTimePackage,
};
