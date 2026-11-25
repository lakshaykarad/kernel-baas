import { string } from "zod";

// shared/types.ts  — DELETE KafkaNotificationPayload, replace NotificationEvent with this
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'WHATSAPP' | 'SMS';
export type NotificationPriority = 'HIGH' | 'BULK';

export type JsonValue = | string | number | boolean | null | JsonObject | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

export interface NotificationEvent {
  eventId: string;                    // ← REQUIRED: idempotency key
  projectId: string;
  userId: string;
  channel: NotificationChannel;
  priority: NotificationPriority;     // ← REQUIRED: matches DB column
  recipient?: string;                 // optional: absent for IN_APP
  title?: string;                     // flat (was payload.title)
  body: string;                       // flat (was payload.body)
  metadata?: JsonObject; // flat (was payload.data), matches DB `metadata Json?`
  retryCount?: number;
  createdAt: number;                  // epoch ms — JSON-safe
  _failure?: FailureMetadata 
}

export const KAFKA_TOPICS = {
  IN_APP : 'notify.in_app',
  EMAIL : 'notify.email',
  WHATSAPP : 'notify.whatsapp',
  SMS : 'notify.sms',
  DLQ : 'notify.dlq'
} as const;

export interface FailureMetadata  {
  error : string,
  stack? : string,
  originalTopic : string,
  failedAt : string
}


