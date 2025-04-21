import Stripe from 'stripe';
import { User } from '../app/modules/user/user.model';
import { stripe } from '../config/stripe';

export const handleAccountConnectEvent = async (data: Stripe.Account) => {
  const existingUser = await User.findOne({
    'accountInformation.stripeAccountId': data.id,
  });
  // check user exist or not
  if (!existingUser) {
    return 'User not found';
  }
  if (data.charges_enabled) {
    const loginLink = await stripe.accounts.createLoginLink(data.id);
    console.log('Login link: ', loginLink);
    // save stripe account information to the user record
    await User.findByIdAndUpdate(
      { _id: existingUser?._id },
      {
        $set: {
          'accountInformation.stripeAccountId': data.id,
          'accountInformation.status': true,
          'accountInformation.externalAccountId':
            data.external_accounts?.data[0]?.id || '',
          'accountInformation.currency': data.default_currency || '',
          'accountInformation.accountUrl': loginLink.url,
        },
      },
      { new: true }
    );
  }
};
