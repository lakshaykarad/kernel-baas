import { kafka } from './kafka.client.js';
import { KAFKA_TOPICS } from '../../../../../shared/types.js';

export const TOPIC_CONFIGS = [
    { topic: KAFKA_TOPICS.IN_APP, numPartitions: 6 },
    { topic: KAFKA_TOPICS.EMAIL, numPartitions: 6 },
    { topic: KAFKA_TOPICS.WHATSAPP, numPartitions: 3 },
    { topic: KAFKA_TOPICS.SMS, numPartitions: 3 },
    { topic: KAFKA_TOPICS.DLQ, numPartitions: 1 },
];

export async function initKafkaTopics(): Promise<void> {
    
    const admin = kafka.admin(); // kafka admin   
    try {
        await admin.connect(); // connection 
        const existingTopic  = await admin.listTopics(); // listing topics 
        const topicsToCreate = []; // hold more topics if not exist yet 

        for(const config of TOPIC_CONFIGS){
            const alreadyExists = existingTopic.includes(config.topic);  
            if(!alreadyExists){
                topicsToCreate.push({
                    topic : config.topic,
                    numPartitions : config.numPartitions,
                    replicationFactor : 1, 
                });
            }
        }
         if (topicsToCreate.length > 0) {
            await admin.createTopics({ topics: topicsToCreate });
            console.log(`[Kafka Admin] Created ${topicsToCreate.length} topics.`);
        } else {
            console.log('[Kafka Admin] All notification topics verified.');
        }
    } finally {
        await admin.disconnect();
    }
    
}