import crypto from 'crypto';
import { db as prisma } from '../../core/db.ts';
import { publishNotificationBatch } from '../../core/kafka/kafka.producer.ts';
import {
    KAFKA_TOPICS,
    type JsonObject,
    type NotificationChannel,
    type NotificationEvent,
    type NotificationPriority,
} from '../../../../../shared/types.ts';


const CHANNEL_TO_TOPIC: Record<NotificationChannel, string> = {
    IN_APP: KAFKA_TOPICS.IN_APP,
    EMAIL: KAFKA_TOPICS.EMAIL,
    WHATSAPP: KAFKA_TOPICS.WHATSAPP,
    SMS: KAFKA_TOPICS.SMS,
}

type BlastUser = {
    id: string;
    email: string | null;
    phone: string | null;
}

export interface SendSingleInput {
    projectId: string;
    userId: string;
    channel: NotificationChannel;
    priority?: NotificationPriority;
    title?: string;
    body: string;
    metadata?: JsonObject;
    eventId?: string;
}
// sendSingleNotification(input) → Real-time Chat / Transactional Alerts
export async function sendSingleNotification(input: SendSingleInput) {
    const user = await prisma.user.findFirst({
        where: { id: input.userId, projectId: input.projectId },
        select: { id: true, email: true, phone: true },
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    const recipient = input.channel === 'EMAIL' ? user.email : input.channel === 'SMS' || input.channel === 'WHATSAPP' ? user.phone ?? undefined : undefined;

    if (input.channel !== 'IN_APP' && !recipient) {
        throw new Error("MISSING_RECIPIENT_CONTACT");
    }

    const event: NotificationEvent = {
        eventId: input.eventId || crypto.randomUUID(),
        projectId: input.projectId,
        userId: user.id,
        channel: input.channel,
        priority: input.priority ?? 'HIGH',
        ...(recipient ? { recipient } : {}),
        ...(input.title ? { title: input.title } : {}),
        body: input.body,
        ...(input.metadata ? { metadata: input.metadata } : {}),
        retryCount: 0,
        createdAt: Date.now(),
    };

    await publishNotificationBatch(CHANNEL_TO_TOPIC[input.channel], [event]);
    // pushed it to kafka with eventId
    return { eventId: event.eventId, queued: true };
}


export interface BulkBlastInput {
    blastId: string;
    projectId: string;
    channel: NotificationChannel;
    title?: string;
    body: string;
    metadata?: JsonObject;
}
// runCursorBulkBlast(input) → Marketing Broadcasts / "Sale is Live!" 
export async function runCursorBulkBlast(
    input: BulkBlastInput
): Promise<void> {

    const BATCH_SIZE = 1000;
    const topic = CHANNEL_TO_TOPIC[input.channel];
    let cursorId: string | undefined = undefined;
    let totalQueued = 0;

    console.log(`[Blast ${input.blastId}] Started for project=${input.projectId}`);
    try {
        while (true) {
            const users: BlastUser[] = await prisma.user.findMany({
                where: { projectId: input.projectId },
                take: BATCH_SIZE,
                ...(cursorId ? { skip: 1, cursor: { id: cursorId } } : {}),
                orderBy: { id: 'asc' },
                select: { id: true, email: true, phone: true },
            });

            if (users.length === 0) break;

            const events: NotificationEvent[] = [];

            for (const user of users) {
                const recipient =input.channel === 'EMAIL'? user.email
                    : input.channel === 'SMS' || input.channel === 'WHATSAPP'?
                    user.phone ?? undefined : undefined;

                if (input.channel !== 'IN_APP' && !recipient) continue;

                events.push({
                    // Deterministic eventId: re-running the exact same blastId won't duplicate rows!
                    eventId: `${input.blastId}:${user.id}`,
                    projectId: input.projectId,
                    userId: user.id,
                    channel: input.channel,
                    priority: 'BULK',
                    ...(recipient ? { recipient } : {}),
                    ...(input.title ? { title: input.title } : {}),
                    body: input.body,
                    ...(input.metadata ? { metadata: input.metadata } : {}),
                    retryCount: 0,
                    createdAt: Date.now(),
                });
            }

            if (events.length > 0) {
                await publishNotificationBatch(topic, events, BATCH_SIZE);
                totalQueued += events.length;
            }

            cursorId = users[users.length - 1].id;
            if (users.length < BATCH_SIZE) break;
        }

        console.log(`[Blast ${input.blastId}] Completed. Queued ${totalQueued} events.`);
    } catch (err) {
        console.error(
            `[Blast ${input.blastId}] Failed after queuing ${totalQueued} events (last cursor=${cursorId ?? 'start'}):`,
            err
        );
    }
}


export async function getUserInbox(projectId: string,
    userId: string, limit = 30
) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    return prisma.notification.findMany({
        where: { projectId, userId, channel: 'IN_APP' },
        orderBy: { createdAt: 'desc' },
        take: safeLimit,
    });
}

export async function markNotificationAsRead(projectId: string,
    userId: string,
    notificationId: string
) {
    return prisma.notification.updateMany({
        where: { id: notificationId, projectId, userId },
        data: { status: 'READ', readAt: new Date() },
    });
}