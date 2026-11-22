import { initKafkaTopics } from './core/kafka/kafka.admin.js';
import { connectKafkaProducer } from './core/kafka/kafka.producer.js';
import { startNotificationWorkers } from './modules/notification/notification.worker.js';

async function bootstrapKafka() {
  await initKafkaTopics();
  await connectKafkaProducer();
  await startNotificationWorkers();
}

bootstrapKafka().catch((err) => {
  console.error('[Kafka Bootstrap Failed]:', err);
  process.exit(1);
});