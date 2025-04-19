import { StatusCodes } from 'http-status-codes';
import { User } from '../app/modules/user/user.model';
import ApiError from '../errors/ApiError';
import Stripe from 'stripe';
import { stripe } from '../config/stripe';

/**
 * Helper to find a user by email.
 * Throws an error if the user is not found.
 */
const getUserByEmail = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return user;
};

/**
 * Handles the Stripe subscription creation event.
 */
export const handleSubscriptionCreated = async (
  subscription: Stripe.Subscription
) => {
  try {
    // Retrieve full subscription data
    const fullSubscription = await stripe.subscriptions.retrieve(
      subscription.id
    );
    console.log('Full Subscription:', fullSubscription);
    // Get productId from subscription
    const productId = fullSubscription.items.data[0]?.price?.product as string;
    if (!productId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Product ID not found in subscription'
      );
    }

    // Get the invoice to retrieve payment details
    const invoice = await stripe.invoices.retrieve(
      fullSubscription.latest_invoice as string
    );
    // const trxId = invoice.payment_intent as string;
    // const amountPaid = (invoice.total || 0) / 100;

    // Get email from the subscription or customer
    // @ts-ignore
    let email = fullSubscription.customer_email;
    if (!email) {
      const customer = await stripe.customers.retrieve(
        fullSubscription.customer as string
      );
      // @ts-ignore
      email = customer.email;
    }

    if (!email) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Email not found in subscription data'
      );
    }

    // Retrieve user by email
    const user = await getUserByEmail(email);
    console.log(user);

    return true;
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error);
    // throw error;
  }
};
