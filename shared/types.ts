export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'WHATSAPP' | 'SMS';

export type NotificationPriority = 'HIGH' | 'BULK';

export interface NotificationEvent {
    eventId : string;
    projectId : string;
    userId : string;
    channel : NotificationChannel;
    priority : NotificationPriority;
    recipient : string;
    payload : {
        title? : string;
        body : string;
        data? : Record<string, any>;  // e.g., { orderId: "ORD-99", discount: "50%" }
    };
    retryCount? : number;
    createdAt : number;
}