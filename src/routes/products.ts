import prisma from '../modules/db';

import { Router } from 'express'
import { handleInputError, isStaff, responseFormatter, errorHandler, validateProductId, isCreator } from '../modules/middleware';
import { body } from 'express-validator';


const router = Router()

router.use(responseFormatter);

router.get('/', async (req, res) => {
    const products = await prisma.product.findMany();
    res.formattedJson(200, products);
});

router.get('/:id', validateProductId, async (req, res) => {
    const product = await prisma.product.findUnique({
        where: { id: req.params.id },
    });
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.formattedJson(200, product);
});

router.post(
    '/',
    [
        isStaff,
        body('name').notEmpty().isString().withMessage('Name is required'),
        body('description').optional().isString().isLength({ min:0 }),
        body('price').notEmpty().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        body('stock').notEmpty().isInt({ min: 0 }),
        handleInputError,
    ],
    async (req, res) => {
        const { name, description, price, stock } = req.body;
        const creatorId = req.user.id;
        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                creatorId,
            },
        });
        res.formattedJson(201, newProduct, 'Product successfully created');
    }
);

router.put(
    '/:id',
    [
        validateProductId,
        isStaff,
        isCreator,
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('description').optional().isLength({ min: 0 }),
        body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
        handleInputError,
    ],
    async (req, res) => {
        const updatedProduct = await prisma.product.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.formattedJson(200, updatedProduct, 'Product successfully updated');
    }
);

router.delete('/:id', validateProductId, isStaff, isCreator, async (req, res) => {
    await prisma.product.delete({
        where: { id: req.params.id },
    });
    res.formattedJson(204, null, 'Product successfully deleted');
});

router.use(errorHandler);

export default router;
