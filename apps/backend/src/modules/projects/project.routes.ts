import {Router} from 'express';
import {createProject} from './project.controller.js';
import {requireAdmin} from '../../middlewares/adminAuth.js';


const router = Router();

router.post('/', requireAdmin,createProject);

export default router