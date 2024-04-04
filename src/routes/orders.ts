import { Router } from 'express';
import * as orderHandlers from '../handlers/orders';
import { errorHandler, isCustomer, responseFormatter, handleInputError, validateId } from '../modules/middleware';
import { body } from 'express-validator';


const router = Router();

router.use(responseFormatter);


router.get('/', orderHandlers.listOrders);

router.get('/:id', validateId, isCustomer, orderHandlers.getOrderById);

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

router.delete('/:id', validateId, isCustomer, orderHandlers.deleteOrder);

router.use(errorHandler);

export default router;
