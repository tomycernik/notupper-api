import { INotification } from "@/domain/models/notification.model";
import { Package } from "@/domain/models/package.model";
import { NotificationRepository } from "@/domain/repositories/notification.repository";

export class NotificationService{

    constructor(private readonly notificationRepository: NotificationRepository){}

    async saveNotification(notification: INotification): Promise<void>{
      return await this.notificationRepository.save(notification)
    }

    async buyPackageNotification(userId: string, packageBuyed: Package): Promise<void>{
      return await this.notificationRepository.save({
        from_user: userId,
        to_user: userId,
        title: "Compra exitosa",
        message: "Has comprado un paquete de monedas",
        delivered: false,
        read: false,
        packageId: packageBuyed.id,
        type: "package_purchase",
        metadata: { coinsAmount: packageBuyed.coins, price: packageBuyed.price },
      })
    }
}