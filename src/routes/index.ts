import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { BrandRoutes } from '../app/modules/brand/brand.route';
import { CarsRoutes } from '../app/modules/cars/cars.route';
import { reserveDetailsRoutes } from '../app/modules/reservedetails/reservedetails.route';
import { ChatRoutes } from '../app/modules/chat/chat.route';
import { MessageRoutes } from '../app/modules/message/message.route';
import { AboutRoutes } from '../app/modules/about/about.route';
import { termsAndConditionsRoutes } from '../app/modules/termsandconditions/termsandconditions.route';
import { PrivacyAndPolicyRoutes } from '../app/modules/privacyandpolicy/privacyandpolicy.route';
import { CategoryRoutes } from '../app/modules/category/category.route';
import { RatingRoutes } from '../app/modules/reting/reting.route';
import { NotificationRoute } from '../app/modules/notification/notification.route';
import { paymentVerificationRoutes } from '../app/modules/paymentVerification/paymentVerification.routes';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/about',
    route: AboutRoutes,
  },
  {
    path: '/terms-and-conditions',
    route: termsAndConditionsRoutes,
  },
  {
    path: '/privacy-and-policy',
    route: PrivacyAndPolicyRoutes,
  },
  {
    path: '/',
    route: BrandRoutes,
  },
  {
    path: '/cars',
    route: CarsRoutes,
  },
  {
    path: '/reserve-details',
    route: reserveDetailsRoutes,
  },
  {
    path: '/chat',
    route: ChatRoutes,
  },
  {
    path: '/message',
    route: MessageRoutes,
  },

  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/rating',
    route: RatingRoutes,
  },
  {
    path: '/',
    route: NotificationRoute,
  },
  {
    path: '/process-car-payment',
    route: paymentVerificationRoutes,
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
