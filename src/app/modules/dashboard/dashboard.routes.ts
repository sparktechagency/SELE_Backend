import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router()
router.get("/dashboard-statistics",auth(USER_ROLES.SUPER_ADMIN), DashboardController.getDashboardStatistics)

export const DashboardRoutes = router