import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth.middleware.js';
import {
    startCheckIfUsernameIsValid,
    startUpdateUserProfile,
    startGetUserById
} from '../../controllers/user.controller.js';

const router = Router();

router.post('/', checkAuth, startCheckIfUsernameIsValid);
router.put('/:userId', checkAuth, startUpdateUserProfile);
router.get('/:userId', checkAuth, startGetUserById);
export default router;
