import {redis} from './redis.client.ts'

// which users currently have an open WebSocket connection
const presenceKey = (projectId: string) => `online:${projectId}`;

export async function markUserOnline(projectId: string, userId: string): Promise<void> {
    await redis.sadd(presenceKey(projectId), userId); // add user
}

export async function markUserOfline(projectId : string, userId: string) : Promise<void> {
    await redis.srem(presenceKey(projectId),userId); // remove user
}

/*

Returns a Set containing only the userIds that are currently online.
*/ 
export async function filterOnlineUsers(projectId : string, userIds: string[]) : Promise<Set<string>>  {
    if (userIds.length === 0) {
        return new Set();
    }

    const results = await redis.smismember(presenceKey(projectId), ...userIds);
    const onlineSet = new Set<string>();

    for (let i = 0; i < userIds.length; i++) {
        if (results[i] === 1) {
            onlineSet.add(userIds[i]);
        }
    }

    return onlineSet;
}