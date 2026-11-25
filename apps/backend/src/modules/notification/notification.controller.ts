import crypto from 'crypto';
import { Request, Response } from 'express';
import {
    getUserInbox,
    markNotificationAsRead,
    runCursorBulkBlast,
    sendSingleNotification
} from './notification.service.ts'

import type { NotificationChannel } from '../../../../../shared/types.ts';

const VALID_CHANNELS = new Set<NotificationChannel>([
    'EMAIL', 'IN_APP', 'SMS', 'WHATSAPP',
]);

function isValidChannel(value: unknown): value is NotificationChannel {
    return typeof value === 'string' && VALID_CHANNELS.has(value as NotificationChannel);
}
// Send a Single Notification (SMPT, SMS, Whatsapp)
export async function sendHandler(
    req: Request,
    res: Response
): Promise<void> {
    const { projectId, userId, channel, priority, title, body, metadata, eventId } = req.body;

    if (!projectId || !userId || !channel || !body) {
        res.status(400).json({
            error: 'projectId, userId, channel and body are required'
        });
        return;
    }

    if (!isValidChannel(channel)) {
        res.status(400).json({
            error: 'Invalid channel.Must be IN_APP, EMAIL, WHATSAPP, or SMS'
        });
        return;
    }

    try {
        const result = await sendSingleNotification({
            projectId, userId, channel, priority, title, body, metadata, eventId,
        });
        res.status(202).json(result);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '';
        if (message === 'USER_NOT_FOUND') {
            res.status(404).json({ error: 'User not found in this project' });
            return;
        }
        if (message === 'MISSING_RECIPIENT_CONTACT') {
            res.status(400).json({ error: 'User is missing email/phone for this channel' });
            return;
        }
        console.error('[Notification Send Error]:', err);
        res.status(500).json({ error: 'Failed to enqueue notification' });
    }
}

// Send a Bulk Notification (IN_APP)
export async function blastHandler(req: Request, res: Response) : Promise<void> {
    const { projectId, channel, title, body, metadata, blastId } = req.body;

    if(!projectId || !channel || !body) {
        res.status(400).json({
            error: 'projectId, channel, and body are required'
        });
        return;
    }

    if(!isValidChannel(channel)){
        res.status(400).json({ error: 'Invalid channel. Must be IN_APP, EMAIL, WHATSAPP, or SMS' });
        return;
    }

    const resolvedBlastId = blastId || crypto.randomUUID();
    // Using cursor loop asynchronously so 100k+ blasts never hit HTTP 504 timeouts

    setImmediate(() => {
        runCursorBulkBlast({
            blastId: resolvedBlastId,
            projectId,
            channel,
            title,
            body,
            metadata
        }).catch((err) =>{
            console.error(`[Blast ${resolvedBlastId}] Background failure:`, err);
        });
    });

    res.status(202).json({
        blastId: resolvedBlastId,
        status: 'ACCEPTED',
        message: 'Bulk notification blast accepted and streaming to Kafka',
    });
}
// Fetch users 'In-App' notifications 
export async function getInboxHandler(req: Request, res: Response): Promise<void> {
  const { projectId, userId, limit } = req.query as {
    projectId?: string;
    userId?: string;
    limit?: string;
  };

  if (!projectId || !userId) {
    res.status(400).json({ error: 'projectId and userId query params are required' });
    return;
  }

  const parsedLimit = limit ? Number.parseInt(limit, 10) : undefined;
  const items = await getUserInbox(
    projectId,
    userId,
    Number.isNaN(parsedLimit) ? undefined : parsedLimit
  );
  res.json({ notifications: items });
}

// Mark a Notification as Read
export async function markReadHandler(req: Request, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { projectId, userId } = req.body;

  if (!id || !projectId || !userId) {
    res.status(400).json({ error: 'id param, projectId, and userId are required' });
    return;
  }

  const result = await markNotificationAsRead(projectId, userId, id);
  if (result.count === 0) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }

  res.json({ updated: true });
}