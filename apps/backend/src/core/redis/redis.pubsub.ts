import {redis, createRedisSubscriber} from './redis.client.ts';
export const REALTIME_CHANNEL = 'kernel:realtime:events';

export interface RealtimeEnvelope{
    type: 'NOTIFICATION' | 'CHAT'; 
    projectId : string;
    userId:  string;
    payload : unknown;
}

export async function publshRealtimeEvent(event : RealtimeEnvelope) : Promise<void> {
    await redis.publish(REALTIME_CHANNEL, JSON.stringify(event));
}

export async function subscribreRealtimeEvents(onEvent: (event: RealtimeEnvelope) => void ) : Promise<void> {
    const subscriber = createRedisSubscriber();
    await subscriber.subscribe(REALTIME_CHANNEL);

    subscriber.on('message', (channel, rawMessage) => {
        if (channel !== REALTIME_CHANNEL) return;

        try {
            const event : RealtimeEnvelope = JSON.parse(rawMessage);
            onEvent(event);
        } catch (err) {
            console.error(`[Redis PubSub] Failed to parse message `, err);
        }
    });

    console.log(`[Redis PubSub] Subscribed to "${REALTIME_CHANNEL}"`);
}
