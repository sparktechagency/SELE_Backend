import Stripe from 'stripe';
import { stripe } from '../../config/stripe';
import ApiError from '../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import config from '../../config';
import { Request, Response } from 'express';
import { handleSubscriptionCreated } from '../../helpers/handleSubscriptionCreated';
import { paymentVerificationModel } from '../modules/paymentVerification/paymentVerification.model';
import { ReserveDetailsModel } from '../modules/reservedetails/reservedetails.model';
import { handleAccountConnectEvent } from '../../helpers/handleAccountConnectEvent';

const handleStripeWebhook = async (req: Request, res: Response) => {
  let event: Stripe.Event | undefined;
  try {
    // Use raw request body for verification
    event = stripe.webhooks.constructEvent(
      req.body,      req.headers['stripe-signature'] as string,
      config.stripe.webhookSecret as string
    );
  } catch (error) {
    // Return an error if verification fails
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Webhook signature verification failed. ${error}`
    );
  }
  if (!event) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid event received!');
  }
  const data = event.data.object as
    | Stripe.Subscription
    | Stripe.Account
    | Stripe.Checkout.Session;
  const eventType = event.type;
  try {
    switch (eventType) {
      case 'account.updated':
        await handleAccountConnectEvent(data as Stripe.Account);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(data as Stripe.Subscription);
        break;
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentIntentId = session.payment_intent;
        const payment = await paymentVerificationModel.findOne({
          checkoutSessionId: session.id,
        });

        if (payment) {
          payment.status = 'successful';
          payment.trxId = paymentIntentId?.toString();
          await payment.save();

          // Update ReserveDetailsModel with trxId
          await ReserveDetailsModel.findByIdAndUpdate(
            payment.reserveId,
            { trxId: paymentIntentId?.toString(), payload: 'Assigned' },

            { new: true }
          );
        }
        break;
      default:
        console.log(`unhandled event type: ${eventType}`);
    }
  } catch (error) {
    // Handle errors during event processing
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Error handling event: ${error}`
    );
  }
  res.sendStatus(200);
};

export default handleStripeWebhook;