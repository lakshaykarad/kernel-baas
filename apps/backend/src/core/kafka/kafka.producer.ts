import { CompressionTypes, Producer } from 'kafkajs';
import { kafka } from './kafka.client.js';
import { KAFKA_TOPICS, NotificationChannel, NotificationEvent } from '../../../../../shared/types.js';

let producer: Producer | null = null; 

const CHANNEL_TOPIC_MAP: Record<NotificationChannel, string> = {
    IN_APP: KAFKA_TOPICS.IN_APP,
    EMAIL: KAFKA_TOPICS.EMAIL,
    WHATSAPP: KAFKA_TOPICS.WHATSAPP,
    SMS: KAFKA_TOPICS.SMS
};

export async function connectKafkaProducer(): Promise<void> {
    if (producer) return;
    producer = kafka.producer({
        allowAutoTopicCreation: false, // don't create topic even it not exist & not create notify.emial (typo)
        idempotent: true // don't send duplicate message
    });
    await producer.connect();
    console.log('[Kafka Producer] Connected and ready.')
}

export async function publishNotificationBatch(
    topic: string,
    events: NotificationEvent[],
    batchSize: number = 1000
): Promise<void> {
    if (!producer) {
        throw new Error('Kafka producer is not connected. Call connectKafkaProducer() first.');
    }

    for (let i = 0; i < events.length; i += batchSize) {
        const chunk = events.slice(i, i + batchSize);
        await producer.send({
            topic,
            compression: CompressionTypes.GZIP,
            messages: chunk.map((event) => ({
                key: event.userId,
                value: JSON.stringify(event), // JS only understand bytes so need to convert it into string 
                headers: { // added metadata to messages so Kafka UI can display them
                    'source-function': 'publishNotificationBatch', // or a more specific one
                    'campaign-id': String(event.metadata?.campaignId ?? 'none')
                }
            })),
        });
    }
}

// Get Topic name from api route
export async function publishChannelEvents(
    channel: NotificationChannel,
    events: NotificationEvent[]
): Promise<void> {
    const topic = CHANNEL_TOPIC_MAP[channel];
    await publishNotificationBatch(topic, events);
}