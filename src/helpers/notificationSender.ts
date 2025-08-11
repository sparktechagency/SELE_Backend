import { INotification } from '../app/modules/notification/notification.interface';
import { Notification } from '../app/modules/notification/notification.model';
import { logger } from '../shared/logger';

export const sendNotifications = async (
  data: INotification
): Promise<INotification> => {
  // console.log("🚀 ~ sendNotifications ~ data:", data)
  const result = await Notification.create(data);
  //@ts-ignore
  const socketIo = global.io;
  if (socketIo) {
    socketIo.emit(`get-notification::${data?.receiver}`, result);
    logger.info("👌👌👌👌👌 Notification sent successfully to user", data?.receiver);
  }
  return result;
};
