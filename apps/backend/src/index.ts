import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import projectRoutes from './modules/projects/project.routes.js';
import notificationRoutes from './modules/notification/notification.routes.ts';
import { db as prisma } from './core/db.ts';
import { redis } from './core/redis/redis.client.ts';
import { kafka } from './core/kafka/kafka.client.ts';
import { bootstrapKafka } from './notification_index.ts';

const app = express();
const PORT = 8000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// The original sanity check route
app.get('/', (_req, res) => {
  res.json({
    status: 'success',
    message: 'Kernel BaaS backend is successfully running!',
  });
});

app.get('/health', async (_req, res) => {
  const checks = { postgres: 'down', redis: 'down', kafka: 'down' };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = 'up';
  } catch {}

  try {
    const pong = await redis.ping();
    if (pong === 'PONG') checks.redis = 'up';
  } catch {}

  const admin = kafka.admin();
  try {
    await admin.connect();
    await admin.listTopics();
    checks.kafka = 'up';
  } catch {
  } finally {
    await admin.disconnect().catch(() => {});
  }

  const allUp = Object.values(checks).every((s) => s === 'up');
  res.status(allUp ? 200 : 503).json({ status: allUp ? 'ok' : 'degraded', checks });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);

  bootstrapKafka().catch((err) => {
    console.error('[Kafka Bootstrap Failed - running in degraded mode]:', err);
  });
});