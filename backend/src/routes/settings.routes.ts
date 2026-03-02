import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { updatePassword, deleteAccount } from '../controller/settings.controller';

const router = Router();

router.use(authenticate);

router.put('/password', updatePassword);
router.delete('/account', deleteAccount);

export default router;
