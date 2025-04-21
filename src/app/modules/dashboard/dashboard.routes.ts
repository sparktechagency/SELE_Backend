import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router()
router.get("/dashboard-statistics",auth(USER_ROLES.SUPER_ADMIN), DashboardController.getDashboardStatistics)
router.get("/recent-user",auth(USER_ROLES.SUPER_ADMIN), DashboardController.getRecentUserForDashboard)
router.get("/all-users",auth(USER_ROLES.SUPER_ADMIN), DashboardController.getAllUsers)
// total earning
router.get("/total-earning",auth(USER_ROLES.SUPER_ADMIN), DashboardController.totalEarning)




// total agency
router.get("/total-agency",auth(USER_ROLES.SUPER_ADMIN), DashboardController.totalAgency)
// get single user
router.get("/single-user/:id",auth(USER_ROLES.SUPER_ADMIN), DashboardController.getSingleUser)
router.delete("/delete-user/:id",auth(USER_ROLES.SUPER_ADMIN), DashboardController.deleteUserFromDB)
router.get("/single-agency/:id",auth(USER_ROLES.SUPER_ADMIN), DashboardController.getSingleAgency)
router.delete("/delete-agency/:id",auth(USER_ROLES.SUPER_ADMIN), DashboardController.deleteAgencyFromDB)
export const DashboardRoutes = router