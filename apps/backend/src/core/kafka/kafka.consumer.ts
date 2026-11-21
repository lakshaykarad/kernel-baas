import { Consumer, Kafka } from 'kafkajs';
import { kafka } from './kafka.client.js';
import { publishNotificationBatch } from './kafka.producer.js';
import { KAFKA_TOPICS, NotificationChannel, NotificationEvent } from '../../../../../shared/types.js';
import type { FailureMetadata } from '../../../../../shared/types.ts'
import { buildFailureMetadata } from './utils/errors.js';

const activeConsumers: Consumer[] = [];

export async function registerChannelWorker(
    groupId: string,
    topic: string,
    handler: (event: NotificationEvent) => Promise<void>
): Promise<void> {
    const consumer = kafka.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            if (!message.value) return;
            const event: NotificationEvent = JSON.parse(message.value.toString());
            try {
                await handler(event);
            } catch (err) {
                const retries = (event.retryCount ?? 0) + 1;
                console.error(
                    `[Worker Error] topic= ${topic} eventId = ${event.eventId} attempt = ${retries}`, err
                );

                if (retries >= 2) {
                    // Move to DLQ (Dead Letter Queue)
                    await publishNotificationBatch(KAFKA_TOPICS.DLQ, [
                        {
                            ...event, retryCount: retries,
                            _failure: buildFailureMetadata(err, topic),
                        },
                    ]);
                }else{
                    await publishNotificationBatch(topic, [
                        {...event, retryCount: retries}
                    ]);
                }
            }
        }
    });

    activeConsumers.push(consumer);
    console.log(`Kafka Consumer] Group "${groupId}" listening on "${topic}"`)
}