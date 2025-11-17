import { INotification } from "@/domain/models/notification.model";

export interface NotificationRepository{
    save(notification: INotification): Promise<void>
}