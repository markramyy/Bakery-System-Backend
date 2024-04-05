import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { createServer } from 'http'
import express from 'express'
import request from 'supertest'
import * as productHandlers from '../handlers/products'
import { responseFormatter } from '../modules/middleware'


vi.mock('../modules/db', async () => {
    // Use the importOriginal helper to keep the actual implementations
    const originalModule = await vi.importActual('../modules/db');

    return {
        __esModule: true,
        default: Object.assign({}, originalModule.default, {
            // Now, override specific methods with your mocks
            product: {
                findMany: vi.fn(() => Promise.resolve([
                    {
                    id: 'product1',
                    name: 'Croissant',
                    description: 'Buttery French pastry',
                    price: 2.99,
                    stock: 15,
                    creatorId: 'creator1',
                    },
                    {
                    id: 'product2',
                    name: 'Sourdough Bread',
                    description: 'Crusty artisan bread',
                    price: 3.99,
                    stock: 10,
                    creatorId: 'creator2',
                    },
                ])),
                findUnique: vi.fn((args) =>
                    args.where.id === 'existing-id'
                    ? Promise.resolve({
                        id: 'existing-id',
                        name: 'Baguette',
                        description: 'Fresh French bread',
                        price: 1.99,
                        stock: 20,
                        creatorId: 'creator1',
                    })
                    : Promise.resolve(null)
                ),
                create: vi.fn(() => Promise.resolve({
                    id: 'new-product-id',
                    name: 'New Cake',
                    description: 'Delicious cake',
                    price: 20,
                    stock: 10,
                    creatorId: 'creator1',
                })),
                update: vi.fn((args) =>
                    args.where.id === 'existing-id'
                    ? Promise.resolve({
                        id: 'existing-id',
                        name: 'Updated Cake',
                        description: 'Even more delicious cake',
                        price: 25,
                        stock: 5,
                        creatorId: 'creator1',
                    })
                    : Promise.reject(new Error('Product not found'))
                ),
                delete: vi.fn((args) =>
                    args.where.id === 'existing-id'
                    ? Promise.resolve({
                        id: 'existing-id',
                    })
                    : Promise.reject(new Error('Product not found'))
                ),
            }
        })
    }
});


const app = express();
app.use(express.json());
app.use(responseFormatter);


vi.mock('../modules/middleware', () => ({
    isStaff: (req, res, next) => next(),
    isCreator: (req, res, next) => next(),
    validateId: (req, res, next) => next(),
    handleInputError: (req, res, next) => next(),
    errorHandler: (err, req, res, next) => res.status(500).json({ message: err.message }),
    responseFormatter: (req, res, next) => {
        res.formattedJson = (status, data, message = '') => {
          res.status(status).json({ data, message });
        };
        next();
    }
}));


app.get('/products', productHandlers.listProducts);
app.get('/products/:id', productHandlers.getProductById);
app.post('/products', productHandlers.createProduct);
app.put('/products/:id', productHandlers.updateProduct);
app.delete('/products/:id', productHandlers.deleteProduct);


const server = createServer(app);


beforeAll(async () => {
    await server.listen(3003);
});

afterAll(async () => {
    await server.close();
});


describe('Products Routes', () => {

    it('should list all products', async () => {
      const res = await request(server).get('/products')
      expect(res.statusCode).toBe(200)
      expect(res.body.data).toBeInstanceOf(Array)
    })


    it('should retrieve a product by ID', async () => {
      const res = await request(server).get('/products/existing-id')
      expect(res.statusCode).toBe(200)
      expect(res.body.data).toHaveProperty('id', 'existing-id')
    })


    it('should return a 404 if the product by ID is not found', async () => {
        const res = await request(server).get('/products/non-existent-id')
        expect(res.statusCode).toBe(404)
        expect(res.body).toHaveProperty('message', 'Product not found')
    })


    it('should create a new product', async () => {
        const mockReq = {
          body: {
            name: 'New Cake',
            description: 'Delicious cake',
            price: 20,
            stock: 10,
          },
          user: { id: 'f4865d2d-8e31-4e26-9a0e-abe6724ec85f' }
        };

        const mockRes = {
          status: vi.fn(() => mockRes),
          json: vi.fn(),
          formattedJson: vi.fn((status, data, message = '') => {
                mockRes.status(status).json({ data, message });
                return mockRes;
            }),
        };

        await productHandlers.createProduct(mockReq, mockRes);

        expect(mockRes.formattedJson).toHaveBeenCalledWith(201, expect.anything(), 'Product successfully created');
    });



    it('should update a product', async () => {
      const res = await request(server).put('/products/existing-id').send({ name: 'Updated Cake', price: 25 })
      expect(res.statusCode).toBe(200)
      expect(res.body.data).toHaveProperty('name', 'Updated Cake')
    })


    it('should delete a product', async () => {
      const res = await request(server).delete('/products/existing-id')
      expect(res.statusCode).toBe(204)
    })
})
