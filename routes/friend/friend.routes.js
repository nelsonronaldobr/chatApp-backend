import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth.middleware.js';
import {
    startCreateFriendRequest,
    startGetSocial,
    startGetFriends,
    startGetFriendRequestsSent,
    startGetFriendRequestsReceived,
    startAcceptedFriendRequest,
    startCancelFriendRequest,
    startDeleteFriend
} from '../../controllers/friendRequest.controller.js';

const router = Router();

router.post('/', checkAuth, startCreateFriendRequest);
router.put('/:id', checkAuth, startAcceptedFriendRequest);
router.patch('/:id', checkAuth, startCancelFriendRequest);
router.delete('/:id', checkAuth, startDeleteFriend);
router.get('/social', checkAuth, startGetSocial);
router.get('/', checkAuth, startGetFriends);
router.get('/sent', checkAuth, startGetFriendRequestsSent);
router.get('/received', checkAuth, startGetFriendRequestsReceived);

export default router;
