import { errorMonitor } from 'events';
import {Redis} from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Redis database and sets up an automatic recoverly plan
export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) { 
    return Math.min(times * 100, 2000);
  },
});


redis.on('connect', () => console.log(`[Redis]: Connected`));
redis.on('error', (err) => console.error(`[Redis]: Error`, err.message));

export function createRedisSubscriber() : Redis{
  const sub = new Redis(REDIS_URL, {
    maxRetriesPerRequest : 3,
    retryStrategy(time){
      return Math.min(time*100,2000);
    },
  });
  sub.on('error', (err) => console.error(`[Redis Sub] Error: `, err.message));
  return sub;
}