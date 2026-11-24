import {Prisma, PrismaClient} from '@prisma/client';
import {registerChannelWorker} from '../../core/kafka/kafka.consumer.js';
import {KAFKA_TOPICS, NotificationEvent} from '../../../../../shared/types.js';

const prisma = new PrismaClient(); 

// In-App notification 
async function processInAppNotification(
    event : NotificationEvent
) : Promise<void> {
    // Separate the data we SAVE to the DB from the data we only USE in memory
    const {recipient, createdAt, metadata , retryCount, ...dbFields} = event;
    try{
        // saves a new notification to the database
        await prisma.notification.create({
            data: {
                ...dbFields, // add info database colums -> { eventId: "e1", projectId: "p1", userId: "u1", channel: "IN_APP", priority: "HIGH", title: "Hello", body: "World" }
                retryCount: retryCount ?? 0,
                metadata: metadata ?? undefined,
                createdAt: new Date(createdAt),
                status: 'PENDING',
            },
        });
        console.log(`[DB Save] Successfully saved IN_APP notification for user ${event.userId}`);

    } catch(err){
        // skip duplicate event
        if (
            typeof err === 'object' &&
            err !== null &&
            'code' in err &&
            err.code === 'P2002'
        ) {
            console.log( `[Idempotency] Skipping duplicate event: ${event.eventId}  `);
            return;
        }
        // if there is still some problem 
        // throw err
        throw err;
    }
}

// start startNotificationWorkers with kernel-in-app-workers Group ID.
export async function startNotificationWorkers() : Promise<void> {
    await registerChannelWorker(
        'kernel-in-app-workers',
        KAFKA_TOPICS.IN_APP,
        processInAppNotification
    );
}