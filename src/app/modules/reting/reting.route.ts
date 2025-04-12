import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { RatingController } from './reting.controller';

const router = express.Router();
router.post("/create" , auth(USER_ROLES.USER, USER_ROLES.AGENCY, USER_ROLES.SUPER_ADMIN),RatingController.createRating )
router.get('/',auth(USER_ROLES.USER, USER_ROLES.AGENCY, USER_ROLES.SUPER_ADMIN), RatingController.getAllRating); 
router.get('/:id',auth(USER_ROLES.USER, USER_ROLES.AGENCY, USER_ROLES.SUPER_ADMIN), RatingController.getSingleRating); 
router.delete("/:id",auth(USER_ROLES.USER, USER_ROLES.AGENCY, USER_ROLES.SUPER_ADMIN), RatingController.deleteRating);
router.patch("/:id",auth(USER_ROLES.USER, USER_ROLES.AGENCY, USER_ROLES.SUPER_ADMIN), RatingController.updateRating);
export const RatingRoutes = router;
