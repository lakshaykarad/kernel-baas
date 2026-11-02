import {Router} from 'express';
import {loginAdmin, refreshAdmin, setupAdmin, registerAdmin} from './auth.controller.js';

const router = Router();

router.post('/setup', setupAdmin);
router.post('/login', loginAdmin);
router.post('/register', registerAdmin );
router.post('/refresh', refreshAdmin);

export default router;