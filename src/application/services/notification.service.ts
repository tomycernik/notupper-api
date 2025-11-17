import { INotification } from "@/domain/models/notification.model";
import { NotificationRepository } from "@/domain/repositories/notification.repository";

export class NotificationService{

    constructor(private readonly notificationRepository: NotificationRepository){}

    async saveNotification(notification: INotification): Promise<void>{
      await this.notificationRepository.save(notification)
    }
    
}