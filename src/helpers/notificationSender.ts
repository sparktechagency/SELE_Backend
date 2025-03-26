import { INotification } from "../app/modules/notification/notification.interface";
import { Notification } from "../app/modules/notification/notification.model";

export const sendNotifications = async (data: INotification): Promise<INotification> => {

    console.log("data=======>>>>>>", data);
    const result = await Notification.create(data);

    //@ts-ignore
    const socketIo = global.io;

    if (socketIo) {
        socketIo.emit(`get-notification::${data?.userId}`, result);
    }

    return result;
}