import { Request, Response, NextFunction } from 'express';

import { checkFixedWindowLimit, checkSlidingWindowLimit } from '../core/redis/redis.ratelimit.ts';
import { redis } from '../core/redis/redis.client.ts';

/* 
  Daily 500 Email, 3 OTP verification in every 10 minute, 
*/
const DAILY_PROJECT_EMAIL_LIMIT = 500;
const OTP_RECIPIENT_LIMIT = 3;
const OTP_WINDOW_SECONDS = 600;
const DAY_SECONDS = 86400;

export async function notificationRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { projectId, channel, userId } = req.body;

  const isBlast = req.path.endsWith('/blast');
  const priority: 'BULK' | 'HIGH' = isBlast
    ? 'BULK'
    : String(req.body.priority ?? '').toUpperCase() === 'HIGH'
      ? 'HIGH'
      : 'BULK';


  // Only EMAIL is rate-limited for now. IN_APP/SMS/WhatsApp workers ship later.
  if (!projectId || channel != 'EMAIL') {
    next();
    return;
  }

  try {
    // /blast -> skip counting (INCR) here, don't ignore the rate limit 
    if (isBlast) {
      await redis.ping();
    } else {
      const projectKey = `rl:email:project:${projectId}`;
      const projectQuota = await checkFixedWindowLimit(
        projectKey,
        DAILY_PROJECT_EMAIL_LIMIT,
        DAY_SECONDS
      );

      if (!projectQuota.allowed) {
        res.setHeader('Retry-After', String(projectQuota.retryAfterSec));
        res.status(429).json({
          error: 'Project daily email quota exceeded',
          retryAfterSec: projectQuota.retryAfterSec,
        });
        return;
      }
    }


    if (userId) {
      const recipientKey = `rl:email:user:${projectId}:${userId}`;
      const recipientQuota = await checkSlidingWindowLimit(
        recipientKey,
        OTP_RECIPIENT_LIMIT,
        OTP_WINDOW_SECONDS
      );


      if (!recipientQuota.allowed) {
        res.setHeader('Retry-After', String(recipientQuota.retryAfterSec));
        res.status(429).json({
          error: 'Too many emails sent to this user recently',
          retryAfterSec: recipientQuota.retryAfterSec,
        });
        return;
      }
    }

    next();

  } catch (err) {
    console.error('[RateLimit] Redis error: ', (err as Error).message);

    if (priority === 'BULK') {
      res.setHeader('Retry-After', '30');
      res.status(503).json({
        error: 'Rate limiter unavailable; bulk notifications temporarily paused',
      });
      return;
    }

    console.warn('[RateLimit] Failing open for HIGH priority notification');
    next();
  }

}