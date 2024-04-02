import { Router } from 'express';


const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Hello All Users' });
});

router.get('/:id', () => {});

router.post('/', () => {});

router.put('/:id', () => {});

router.delete('/:id', () => {});


export default router;
