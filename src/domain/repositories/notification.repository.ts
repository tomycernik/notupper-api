import { INotification } from "@/domain/models/notification.model";

export interface NotificationRepository{
    update(id: string, fields: any): Promise<void>;
    save(notification: INotification): Promise<void>
}