// shared/types.ts  — DELETE KafkaNotificationPayload, replace NotificationEvent with this
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'WHATSAPP' | 'SMS';
export type NotificationPriority = 'HIGH' | 'BULK';

export interface NotificationEvent {
  eventId: string;                    // ← REQUIRED: idempotency key
  projectId: string;
  userId: string;
  channel: NotificationChannel;
  priority: NotificationPriority;     // ← REQUIRED: matches DB column
  recipient?: string;                 // optional: absent for IN_APP
  title?: string;                     // flat (was payload.title)
  body: string;                       // flat (was payload.body)
  metadata?: Record<string, unknown>; // flat (was payload.data), matches DB `metadata Json?`
  retryCount?: number;
  createdAt: number;                  // epoch ms — JSON-safe
}