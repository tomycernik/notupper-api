import { notificationType } from "@/config/mappings";
import { INotification } from "@/domain/models/notification.model";
import { NotificationRepository } from "@/domain/repositories/notification.repository";
import { supabase } from "@/config/supabase";

export class NotificationRepositorySupabase implements NotificationRepository{
    async save(notification: INotification): Promise<any> {
        const notificationEntity = {
            from_user: notification.from_user,
            to_user: notification.to_user,
            title: notification.title,
            message: notification.message,
            metadata: notification.metadata,
            delivered: notification.delivered,
            read: notification.read,
            notification_type_id: notificationType[notification.type],
        }
        const {data, error} = await supabase
        .from("notification")
        .insert(notificationEntity)
        .select()
        .single()

        if(error){
            console.log(error)
            throw new Error("No se pudo crear notificación")
        }
        return data;
    }
    
}