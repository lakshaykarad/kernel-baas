import {Router} from 'express';
import {loginAdmin, setupAdmin} from './auth.controller.js';

const router = Router();

router.post('/setup', setupAdmin);
router.post('/login', loginAdmin);

export default router;