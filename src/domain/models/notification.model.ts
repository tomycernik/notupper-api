type NotificationType = "like" | "comment" | "system" | "package_purchase";

export interface INotification{
    id?:string,
    from_user?: string;
    to_user: string;
    title: string;
    message: string;
    delivered: boolean;
    read: boolean;
    metadata?: any;
    type: NotificationType;
    packageId?: string;
}