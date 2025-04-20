import { Types } from "mongoose";

export interface INotification {
    userId: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt?: Date;
    filePath?:"conversion" | "reservation" | "allOrder"
    reserVationId?:Types.ObjectId
    conversionId?:Types.ObjectId
}


