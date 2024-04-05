import { Router } from 'express'
import { handleInputError, isStaff, responseFormatter, errorHandler, validateId, isCreator } from '../modules/middleware';
import { body } from 'express-validator';
import * as productHandlers from '../handlers/products';


const router = Router()

router.use(responseFormatter);

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product CRUD operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           ReadOnly: true
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         description:
 *           type: string
 *           description: The description of the product
 *         price:
 *           type: number
 *           format: float
 *           description: The price of the product
 *         stock:
 *           type: integer
 *           description: The stock quantity of the product
 *       example:
 *         id: 92d471a4-4b90-43b1-8503-298927f89f6d
 *         name: French Baguette
 *         description: Freshly baked every morning.
 *         price: 2.99
 *         stock: 120
*/

/**
 * @swagger
 * /api/products/:
 *   get:
 *     summary: Lists all the products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', productHandlers.listProducts);


/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Gets a product by id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product id
 *     responses:
 *       200:
 *         description: A single product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found.
 */
router.get('/:id', validateId, productHandlers.getProductById);


/**
 * @swagger
 * /api/products/:
 *   post:
 *     summary: Creates a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: The product was successfully created.
 *       400:
 *         description: Invalid input.
 */
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


/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Updates a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: The product was updated.
 *       404:
 *         description: Product not found.
 *       400:
 *         description: Invalid input.
 */
router.put(
    '/:id',
    [
        isStaff,
        isCreator,
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('description').optional().isLength({ min: 0 }),
        body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
        handleInputError,
    ],
    validateId,
    productHandlers.updateProduct
);


/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Deletes a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product id
 *     responses:
 *       204:
 *         description: The product was deleted.
 *       404:
 *         description: Product not found.
 */
router.delete('/:id', validateId, isStaff, isCreator, productHandlers.deleteProduct);

router.use(errorHandler);

export default router;
