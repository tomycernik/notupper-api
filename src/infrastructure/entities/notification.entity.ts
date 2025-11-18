export interface NotificationEntity{
    id: string,
    created_at: string,
    from_user?: string;
    to_user: string;
    title: string;
    message: string;
    delivered: boolean;
    read: boolean;
    metadata?: any;
    notification_type_id: string;
}