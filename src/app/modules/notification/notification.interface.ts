import { Types } from "mongoose";

export interface INotification {
    sender: Types.ObjectId
    receiver: Types.ObjectId
    title: string;
    message: string;
    isRead: boolean;
    createdAt?: Date;
    filePath?: "conversion" | "reservation" | "allOrder"
    referenceId?: Types.ObjectId
}


