import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth.middleware.js';
import { startSearchUsers } from '../../controllers/search.controller.js';

const router = Router();

router.get('/user', checkAuth, startSearchUsers);

export default router;
