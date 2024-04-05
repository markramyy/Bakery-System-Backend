import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import express from 'express';
import request from 'supertest';
import * as ordersHandlers from '../handlers/orders';
import { responseFormatter, isAuth } from '../modules/middleware';
import prisma from '../modules/db';
import { OrderItem } from '@prisma/client';

vi.mock('../modules/db', async () => {
    const originalModule = await vi.importActual('../modules/db');
    return {
        __esModule: true,
        default: Object.assign({}, originalModule.default, {
            order: {
                findMany: vi.fn(() => Promise.resolve([
                    {
                        id: 'order1',
                        userId: 'user1',
                        status: 'PENDING',
                        totalPrice: 100,
                        orderItems: [
                            {
                                productId: 'product1',
                                quantity: 2,
                                price: 50,
                            },
                        ],
                    },
                ])),
                findUnique: vi.fn((args) => {
                    if (args.where.id === 'valid-order-id') {
                        return Promise.resolve({
                            id: 'valid-order-id',
                            userId: 'user1',
                            status: 'PENDING',
                            totalPrice: 100,
                            orderItems: [
                                {
                                    productId: 'product1',
                                    quantity: 2,
                                    price: 50,
                                },
                            ],
                        });
                    } else {
                        return Promise.resolve(null);
                    }
                }),
                create: vi.fn(() => Promise.resolve({
                    id: 'new-order-id',
                    userId: 'user1',
                    status: 'PENDING',
                    totalPrice: 100,
                    orderItems: [
                        {
                            productId: 'product1',
                            quantity: 2,
                            price: 50,
                        },
                    ],
                })),
                update: vi.fn(() => Promise.resolve({
                    id: 'valid-order-id',
                    userId: 'user1',
                    status: 'PENDING',
                    totalPrice: 200,
                    orderItems: [
                        {
                            productId: 'product2',
                            quantity: 4,
                            price: 50,
                        },
                    ],
                })),
                delete: vi.fn(() => Promise.resolve()),
            },
            product: {
                findMany: vi.fn(() => Promise.resolve([
                    {
                        id: 'product1',
                        name: 'Product 1',
                        stock: 10,
                        price: 50,
                    },
                    {
                        id: 'product2',
                        name: 'Product 2',
                        stock: 8,
                        price: 50,
                    },
                ])),
                update: vi.fn(() => Promise.resolve({
                    id: 'product1',
                    stock: 8,
                })),
            },
            orderItem: {
                deleteMany: vi.fn(() => Promise.resolve()),
            },
            $transaction: vi.fn(async (callback) => {
                // Mock the prisma context that would be passed to the transaction callback
                const transactionContext = {
                    order: {
                        findUnique: vi.fn((args) => {
                            if (args.where.id === 'order-to-delete') {
                                return Promise.resolve({
                                    id: 'order-to-delete',
                                    userId: 'user1',
                                    orderItems: [
                                        { productId: 'product1', quantity: 1 },
                                        { productId: 'product2', quantity: 2 },
                                    ],
                                });
                            }
                            return Promise.resolve(null);
                        }),
                        delete: vi.fn((args) => {
                            if (args.where.id === 'order-to-delete') {
                                return Promise.resolve({ id: 'order-to-delete' });
                            }
                            return Promise.resolve(null);
                        }),
                    },
                    orderItem: {
                        deleteMany: vi.fn((args) => {
                            if (args.where.orderId === 'order-to-delete') {
                                return Promise.resolve({
                                    count: 2,
                                });
                            }
                            return Promise.resolve({ count: 0 });
                        }),
                    },
                    product: {
                        update: vi.fn((args) => {
                            if (args.where.id === 'product1') {
                                return Promise.resolve({
                                    id: 'product1',
                                    stock: 9,
                                });
                            }
                            if (args.where.id === 'product2') {
                                return Promise.resolve({
                                    id: 'product2',
                                    stock: 12,
                                });
                            }
                            return Promise.resolve(null);
                        }),
                    },
                };

                return callback(transactionContext);
            }),
        }),
    };
});


vi.mock('../modules/middleware', () => ({
    responseFormatter: (req, res, next) => {
        res.formattedJson = (status, data, message = '') => {
            res.status(status).json({ data, message });
        };
        next();
    },
    isAuth: vi.fn((req, res, next) => {
        req.user = { id: 'f4865d2d-8e31-4e26-9a0e-abe6724ec85f' };
        next();
    }),
}));


const app = express();

app.use(express.json());
app.use(responseFormatter);
app.use(isAuth);


app.get('/orders', ordersHandlers.listOrders);
app.get('/orders/:id', ordersHandlers.getOrderById);
app.post('/orders', ordersHandlers.createOrder);
app.put('/orders/:id', ordersHandlers.updateOrder);
app.delete('/orders/:id', ordersHandlers.deleteOrder);

const server = createServer(app);

beforeAll(async () => {
    await server.listen(3003);
});

afterAll(async () => {
    await server.close();
});


describe('Orders Routes', () => {

    it('should list all orders for a user', async () => {
        const res = await request(server).get('/orders');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBeTruthy();
    });


    it('should retrieve an order by ID', async () => {
        const res = await request(server).get('/orders/valid-order-id');
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('id', 'valid-order-id');
    });


    it('should return 404 if order not found', async () => {
        const res = await request(server).get('/orders/invalid-order-id');
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Order not found');
    });


    it('should create a new order', async () => {
        const orderData = {
            userId: 'user1',
            orderItems: [
                {
                    productId: 'product1',
                    quantity: 2,
                },
            ],
        };
        const res = await request(server).post('/orders').send(orderData);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Order successfully created');
    });


    it('should update an order', async () => {
        const orderUpdateData = {
            userId: 'user1',
            orderItems: [
                {
                    productId: 'product2',
                    quantity: 4,
                },
            ],
        };
        const res = await request(server).put('/orders/valid-order-id').send(orderUpdateData);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Order successfully updated');
    });


    it('should delete an order', async () => {
        const res = await request(server).delete('/orders/order-to-delete');
        expect(res.statusCode).toBe(204);
    });


    it('should create a new order with multiple items', async () => {
        const orderData = {
            userId: 'user1',
            orderItems: [
                {
                    productId: 'product1',
                    quantity: 1,
                },
                {
                    productId: 'product2',
                    quantity: 2,
                },
            ],
        };
        const res = await request(server).post('/orders').send(orderData);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Order successfully created');
    });


    it('should not create an order with non-existent products', async () => {
        const orderData = {
            userId: 'user1',
            orderItems: [
                {
                    productId: 'invalid-product-id',
                    quantity: 1,
                },
            ],
        };
        const res = await request(server).post('/orders').send(orderData);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Product with ID invalid-product-id not found');
    });


    it('should not create an order when product stock is insufficient', async () => {
        const orderData = {
            userId: 'user1',
            orderItems: [
                {
                    productId: 'product1',
                    quantity: 11,
                },
            ],
        };
        const res = await request(server).post('/orders').send(orderData);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Not enough stock for product with ID product1');
    });


    it('should return 404 if trying to update a non-existent order', async () => {
        const orderUpdateData = {
            userId: 'user1',
            orderItems: [
                {
                    productId: 'product2',
                    quantity: 4,
                },
            ],
        };
        const res = await request(server).put('/orders/invalid-order-id').send(orderUpdateData);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Order not found');
    });


    it('should not create an order with a non-existent product', async () => {
        const orderData = {
            orderItems: [
                { productId: 'non-existent-product', quantity: 1 },
            ],
        };
        const res = await request(server).post('/orders').send(orderData);
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toContain('Product with ID non-existent-product not found');
    });


    it('should not create an order due to insufficient stock', async () => {
        const orderData = {
            orderItems: [
                { productId: 'product1', quantity: 100 },
            ],
        };
        const res = await request(server).post('/orders').send(orderData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('Not enough stock for product with ID product1');
    });


    it('should not update the order due to a non-existent product', async () => {
        const orderUpdateData = {
            orderItems: [
                { productId: 'non-existent-product', quantity: 1 },
            ],
        };
        const res = await request(server).put('/orders/valid-order-id').send(orderUpdateData);
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toContain('Product with ID non-existent-product not found');
    });


    it('should not update an order due to insufficient stock for the updated quantities', async () => {
        const orderUpdateData = {
            orderItems: [
                {
                    productId: 'product2',
                    quantity: 10,
                },
            ],
        };
        const res = await request(server).put('/orders/valid-order-id').send(orderUpdateData);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('Not enough stock for product with ID product2');
    });


    it('should return 404 when trying to delete a non-existent order or unauthorized order', async () => {
        const res = await request(server).delete('/orders/non-existent-or-unauthorized-order-id');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toContain("Order not found or you're not authorized to delete this order");
    });


});
