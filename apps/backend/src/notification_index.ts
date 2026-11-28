import { initKafkaTopics } from './core/kafka/kafka.admin.js';
import { connectKafkaProducer } from './core/kafka/kafka.producer.js';
import { startNotificationWorkers } from './modules/notification/notification.worker.js';

export async function bootstrapKafka() : Promise<void>{
  await initKafkaTopics();
  await connectKafkaProducer();
  await startNotificationWorkers();
}
