import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { BrandRoutes } from '../app/modules/brand/brand.route';
import { AboutusRoutes } from '../app/modules/aboutus/aboutus.route';
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
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
