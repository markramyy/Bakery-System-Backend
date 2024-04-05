import { Router } from 'express';
import * as orderHandlers from '../handlers/orders';
import { errorHandler, isCustomer, responseFormatter, handleInputError, validateId } from '../modules/middleware';
import { body } from 'express-validator';


const router = Router();

router.use(responseFormatter);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order CRUD operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           Read only: true
 *           description: The auto-generated id of the order
 *         userId:
 *           type: string
 *           description: The id of the user who placed the order
 *         status:
 *           type: string
 *           description: The status of the order
 *         totalPrice:
 *           type: number
 *           format: float
 *           description: The total price of the order
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the order was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the order was last updated
 *         orderItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *     OrderItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           readOnly: true
 *           description: The auto-generated id of the order item
 *         orderId:
 *           type: string
 *           description: The id of the order
 *         productId:
 *           type: string
 *           description: The id of the product
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: The quantity of the product
 *         price:
 *           type: number
 *           format: float
 *           description: The price of the product
 */


/**
 * @swagger
 * /api/orders/:
 *   get:
 *     summary: Lists all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: A list of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/', orderHandlers.listOrders);


/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order id
 *     responses:
 *       200:
 *         description: Order data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order was not found
 */
router.get('/:id', validateId, isCustomer, orderHandlers.getOrderById);


/**
 * @swagger
 * /api/orders/:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *             example:
 *               orderItems:
 *                 - productId: "prod_abcdef"
 *                   quantity: 2
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input
 */
router.post(
    '/',
    [
        body('orderItems').isArray({ min: 1 }).withMessage('Order items must be an array with at least one item'),
        body('orderItems.*.productId').isString().withMessage('Product ID must be a string'),
        body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
        body('status').isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'DELIVERED']).withMessage('Invalid status').optional(),
    ],
    handleInputError,
    isCustomer,
    orderHandlers.createOrder
)


/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *             example:
 *               orderItems:
 *                 - productId: "prod_abcdef"
 *                   quantity: 1
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       400:
 *         description: Invalid input
 */
router.put(
    '/:id',
    validateId,
    [
        body('orderItems').isArray({ min: 1 }).withMessage('Order items must be an array with at least one item'),
        body('orderItems.*.productId').isString().withMessage('Product ID must be a string'),
        body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
        body('status').isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'DELIVERED']).withMessage('Invalid status').optional(),
    ],
    handleInputError,
    isCustomer,
    orderHandlers.updateOrder
)


/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order id
 *     responses:
 *       204:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
router.delete('/:id', validateId, isCustomer, orderHandlers.deleteOrder);

router.use(errorHandler);

export default router;
