import prisma from '../modules/db';

import { Router } from 'express'
import { handleInputError, isStaff, responseFormatter, errorHandler, validateId, isCreator } from '../modules/middleware';
import { body } from 'express-validator';
import * as productHandlers from '../handlers/products';


const router = Router()

router.use(responseFormatter);

router.get('/', productHandlers.listProducts);

router.get('/:id', validateId, productHandlers.getProductById);

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
    productHandlers.createProduct
);

router.put(
    '/:id',
    [
        validateId,
        isStaff,
        isCreator,
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('description').optional().isLength({ min: 0 }),
        body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
        handleInputError,
    ],
    productHandlers.updateProduct
);

router.delete('/:id', validateId, isStaff, isCreator, productHandlers.deleteProduct);

router.use(errorHandler);

export default router;
