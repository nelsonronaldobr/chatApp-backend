import { Router } from 'express';
import {
    loginValidations,
    registerValidations
} from '../../validations/authValidations.js';
import { checkAuth } from '../../middlewares/checkAuth.middleware.js';
import {
    startLogin,
    startRegister,
    startRenewToken
} from '../../controllers/auth.controller.js';
import { expressValidator } from '../../validations/expressValidator.middleware.js';
const router = Router();

/* -------------------------------------------------------------------------- */
/*                                    LOGIN                                   */
/* -------------------------------------------------------------------------- */
router.post('/', [...loginValidations, expressValidator], startLogin);
/* -------------------------------------------------------------------------- */
/*                                  REGISTER                                  */
/* -------------------------------------------------------------------------- */
router.post(
    '/register',
    [...registerValidations, expressValidator],
    startRegister
);

/* -------------------------------------------------------------------------- */
/*                                    RENEW                                   */
/* -------------------------------------------------------------------------- */
router.get('/renew', checkAuth, startRenewToken);
export default router;
