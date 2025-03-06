import { Router } from 'express';
import swaggerSpec from '../../swagger';

const router = Router();

router.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

export default router;
