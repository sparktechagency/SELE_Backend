import validateRequest from '../../middlewares/validateRequest';
import { ReserveDetailsValidations } from './reservedetails.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import express from 'express';
import { ReserveDetailsController } from './reservedetails.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import attachUserFilesIfMissing from '../../../util/attachUserFilesIfMissing';
const router = express.Router();
// create
router.post(
  '/',
  fileUploadHandler(),
  auth(USER_ROLES.USER),
  attachUserFilesIfMissing,
  validateRequest(ReserveDetailsValidations.reserveDetailsSchema),
  ReserveDetailsController.createReserveDetails
);

// get all reserve details
router.get(
  '/',
  auth(USER_ROLES.USER, USER_ROLES.AGENCY),
  ReserveDetailsController.getAllReserveDetails
);

// specific user reserve details
router.get(
  '/specific',
  auth(USER_ROLES.USER, USER_ROLES.AGENCY),
  ReserveDetailsController.getSpecificReserveDetails
);
// statistics
router.get("/statistics", auth(USER_ROLES.AGENCY), ReserveDetailsController.getReserveStatistics)

// history
router.get("/history", auth(USER_ROLES.USER, USER_ROLES.AGENCY), ReserveDetailsController.getSpecificReserveHistory)
// get single
router.get('/:id', ReserveDetailsController.getSingleReserveDetails);

// delete
router.delete('/:id', ReserveDetailsController.deleteReserveDetails);

// ! verify from admin
router.patch('/verify/:id', auth(USER_ROLES.SUPER_ADMIN), ReserveDetailsController.ReservationVerify);

// update
router.patch(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.AGENCY, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  ReserveDetailsController.updateReserveDetails
);
export const reserveDetailsRoutes = router;
