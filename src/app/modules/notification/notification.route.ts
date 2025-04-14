import { Router } from "express";
import { NotificationController } from "./notification.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
const route = Router()

route.post("/create-notification", NotificationController.createNotification)
route.get("/get-notification", NotificationController.getAllNotifications)
route.get("/get-notifications/:userId", NotificationController.getNotificationsByUserId)
route.put("/update-notification/:notificationId", NotificationController.updateNotification)

export const NotificationRoute = route
