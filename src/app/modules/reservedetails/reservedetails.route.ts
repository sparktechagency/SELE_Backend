import express from 'express';
import { ReservedetailsController } from './reservedetails.controller';

const router = express.Router();
// create
router.post('/', ReservedetailsController.createReserveDetails);

// get all 
router.get("/", ReservedetailsController.getAllReserveDetails)

// get single
router.get("/:reserDetailsID", ReservedetailsController.getSingleReserDetails)

// update
router.patch("/:reserDetailsID", ReservedetailsController.updateReserDetails)

// delete
router.delete("/:reserDetailsID", ReservedetailsController.deleteReserveDetails)

export const ReservedetailsRoutes = router;
