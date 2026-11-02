import {Router} from 'express';
import {createProject} from './project.controller.js';
import {requireAdmin} from '../../middlewares/adminAuth.js';


const router = Router();

router.post('/', requireAdmin, createProject);
router.get('/', requireAdmin, getMyProjects);  
router.get('/super-admin', requireAdmin, requireSuperAdmin, getSuperAdminOverview);  

export default router;