import Stripe from 'stripe';

const handleStripeWebhook = async (req: Request, res: Response) => {
  let event: Stripe.Event | undefined;
  console.log('event============>', event);
};

export default handleStripeWebhook;
