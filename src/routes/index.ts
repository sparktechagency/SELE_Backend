import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { BrandRoutes } from '../app/modules/brand/brand.route';
import { AboutusRoutes } from '../app/modules/aboutus/aboutus.route';
import { CarsRoutes } from '../app/modules/cars/cars.route';
import { reserveDetailsRoutes } from '../app/modules/reservedetails/reservedetails.route';
import { ChatRoutes } from '../app/modules/chat/chat.route';
import { MessageRoutes } from '../app/modules/message/message.route';
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
    path: "/",
    route: BrandRoutes
  },
  {
    path: "/about-us",
    route: AboutusRoutes
  },
  {
    path: "/cars",
    route: CarsRoutes
  },
  {
    path: "/reserve-details",
    route: reserveDetailsRoutes
  },
  {
    path: "/chat",
    route: ChatRoutes
  },
  {
    path: "/message",
    route: MessageRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
