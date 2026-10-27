import {Router} from 'express';
import {setupAdmin} from './auth.controller.js';

const router = Router();

router.post('/setup', setupAdmin);

export default router;