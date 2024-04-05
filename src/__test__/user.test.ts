import { describe, it, expect, vi, afterAll } from 'vitest';
import { createServer } from 'http';
import express from 'express';
import request from 'supertest';
import * as userHandlers from '../handlers/user';
import { responseFormatter } from '../modules/middleware';
import prisma from '../modules/db';


vi.mock('../modules/db', async () => {
    const originalModule = await vi.importActual('../modules/db');
    return {
        __esModule: true,
        default: Object.assign({}, originalModule.default, {
        user: {
            findFirst: vi.fn((args) => {
            if (args.where.OR.some((condition) => condition.email === 'existing@example.com')) {
                return Promise.resolve({
                email: 'existing@example.com',
                username: 'existing',
                password: 'hashedpassword',
                });
            } else if (args.where.OR.some((condition) => condition.username === 'existing')) {
                return Promise.resolve({
                email: 'existing@example.com',
                username: 'existing',
                password: 'hashedpassword',
                });
            }
            return Promise.resolve(null);
            }),
            create: vi.fn(() => Promise.resolve({
            id: 'new-user-id',
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'hashedpassword',
            })),
            findUnique: vi.fn((args) => {
            if (args.where.username === 'existing') {
                return Promise.resolve({
                id: 'existing-id',
                username: 'existing',
                email: 'existing@example.com',
                password: 'hashedpassword',
                });
            }
            return Promise.resolve(null);
            }),
        },
        }),
    };
});


vi.mock('../modules/auth', () => ({
    comparePassword: vi.fn((password, hashedPassword) => Promise.resolve(password === hashedPassword)),
    createJWT: vi.fn((user) => `mocked-jwt-token-for-${user.id}`),
    hashPassword: vi.fn((password) => Promise.resolve(`hashed-${password}`)),
}));


vi.mock('../modules/middleware', () => ({
    responseFormatter: (req, res, next) => {
        res.formattedJson = (status, data, message = '') => {
        res.status(status).json({ data, message });
        };
        next();
    },
}));


const app = express();
app.use(express.json());
app.use(responseFormatter);

app.post('/signup', userHandlers.signUp);
app.post('/signin', userHandlers.signIn);

const server = createServer(app);


afterAll(async () => {
    await server.close();
});

describe('User Routes', () => {

    it('should create a new user successfully', async () => {
        const res = await request(server).post('/signup').send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password',
        role: 'user',
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'User has been created successfully');
        expect(res.body).toHaveProperty('token');
    });


    it('should not create a user if the email already exists', async () => {
        const res = await request(server).post('/signup').send({
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password',
        role: 'user',
        });
        expect(res.statusCode).toBe(409);
        expect(res.body).toHaveProperty('message', 'Email already exists, try another one.');
    });


    it('should not create a user if the username already exists', async () => {
        const res = await request(server).post('/signup').send({
        username: 'existing',
        email: 'newuser@example.com',
        password: 'password',
        role: 'user',
        });
        expect(res.statusCode).toBe(409);
        expect(res.body).toHaveProperty('message', 'Username already exists, try another one.');
    });


    it('should handle unexpected errors during user creation', async () => {
        vi.mocked(prisma.user.create).mockRejectedValueOnce(new Error('Unexpected error'));
        const res = await request(server).post('/signup').send({
            username: 'errorcase',
            email: 'error@example.com',
            password: 'password',
            role: 'user',
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Something went wrong');
    });


    it('should sign in the user successfully', async () => {
        const res = await request(server).post('/signin').send({
        username: 'existing',
        password: 'hashedpassword',
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'User has Logged in successfully');
        expect(res.body).toHaveProperty('token');
    });


    it('should not sign in with non-existing username', async () => {
        const res = await request(server).post('/signin').send({
        username: 'nonexisting',
        password: 'password',
        });
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid Credentials');
    });


    it('should not sign in with incorrect password', async () => {
        const res = await request(server).post('/signin').send({
        username: 'existing',
        password: 'wrongpassword',
        });
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid Credentials');
    });


    it('should handle unexpected errors during sign in', async () => {
        vi.mocked(prisma.user.findUnique).mockRejectedValueOnce(new Error('Unexpected error'));
        const res = await request(server).post('/signin').send({
            username: 'existing',
            password: 'hashedpassword',
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Something went wrong');
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

});
