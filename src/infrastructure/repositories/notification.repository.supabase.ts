import { INotification } from "@/domain/models/notification.model";
import { NotificationRepository } from "@/domain/repositories/notification.repository";
import { supabase } from "@/config/supabase";
import { notificationMap } from "@/config/mappings";

export class NotificationRepositorySupabase implements NotificationRepository {
    async update(id: string, fields: any): Promise<void> {
        const { error } = await supabase
            .from("notification")
            .update(fields)
            .eq("id", id)

        if (error) {
            console.log(error)
            throw new Error("No se pudo actualizar notificación")
        }
    }
    async save(notification: INotification): Promise<void> {
        const notificationEntity = {
            from_user: notification.from_user,
            to_user: notification.to_user,
            title: notification.title,
            message: notification.message,
            metadata: notification.metadata,
            delivered: notification.delivered,
            read: notification.read,
            notification_type_id: notificationMap[notification.type],
        }
        const { error } = await supabase
            .from("notification")
            .insert(notificationEntity)
            .select()
            .single<INotification>()

        if (error) {
            console.log(error)
            throw new Error("No se pudo crear notificación")
        }
    }
}