import { Router } from 'express';
import * as userHandlers from '../handlers/user';


const router = Router();


router.get('/me', (req, res) => {
    userHandlers.me(req, res);
});

router.post('/:id/change-password', (req, res) => {
    userHandlers.changePassword(req, res);
});

router.post('/:id/validate-password', (req, res) => {
    userHandlers.validatePassword(req, res);
});

router.put('/:id/update-me', (req, res) => {
    userHandlers.updateMe(req, res);
});

router.delete('/:id', (req, res) => {
    userHandlers.deleteUser(req, res);
});

export default router;
