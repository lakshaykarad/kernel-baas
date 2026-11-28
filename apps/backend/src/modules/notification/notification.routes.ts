import { Router } from 'express';
import { notificationRateLimit } from '../../middlewares/notificationRateLimit.ts';
import {
  blastHandler,
  getInboxHandler,
  markReadHandler,
  sendHandler,
} from './notification.controller.ts';
// Note: plug in your existing `adminAuth` (or future `apiKeyAuth`) middleware here

const router = Router();

router.post('/send', notificationRateLimit, sendHandler);
router.post('/blast', notificationRateLimit, blastHandler);
router.get('/', getInboxHandler);
router.patch('/:id/read', markReadHandler);

export default router;