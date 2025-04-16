import { Router } from "express";
import { NotificationController } from "./notification.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
const route = Router()

route.post("/create-notification", NotificationController.createNotification)
route.get("/get-notification", auth(USER_ROLES.AGENCY, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),  NotificationController.getAllNotifications)
route.get("/get-notifications/:userId",  NotificationController.getNotificationsByUserId)
route.patch("/update-notification/:notificationId", auth(USER_ROLES.USER, USER_ROLES.AGENCY, USER_ROLES.SUPER_ADMIN), NotificationController.updateNotification)

export const NotificationRoute = route
 