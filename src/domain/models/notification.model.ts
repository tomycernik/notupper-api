type NotificationType = "like" | "comment"

export interface INotification{
    from_user?: string;
    to_user: string;
    title: string;
    message: string;
    delivered: boolean;
    read: boolean;
    metadata?: any;
    type: NotificationType;
}