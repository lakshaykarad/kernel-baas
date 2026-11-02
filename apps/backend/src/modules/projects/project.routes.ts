import { Router } from 'express';
import { createProject, getMyProjects, getSuperAdminOverview } from './project.controller.js';
import { requireAdmin, requireSuperAdmin } from '../../middlewares/adminAuth.js';

const router = Router();

router.post('/', requireAdmin, createProject);
router.get('/', requireAdmin, getMyProjects);  
router.get('/super-admin', requireAdmin, requireSuperAdmin, getSuperAdminOverview);  

export default router;