import { Router } from 'express';
import * as userHandlers from '../handlers/user';


const router = Router();


/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: User registration & authentication
 */


/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Sign in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *               password:
 *                 type: string
 *                 description: The user's password
 *             example:
 *               username: customer
 *               password: customer123
 *     responses:
 *       200:
 *         description: Sign-in was successful, and the user token was returned.
 *       401:
 *         description: Unauthorized access - invalid credentials.
 */
router.post('/signin', userHandlers.signIn);


/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's desired username
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address
 *               password:
 *                 type: string
 *                 description: The user's chosen password
 *                 format: password
 *               role:
 *                 type: string
 *                 description: The user's role
 *             example:
 *               username: customer
 *               email: customer@example.com
 *               password: customer123
 *               role: customer
 *     responses:
 *       201:
 *         description: User was successfully created.
 *       400:
 *         description: Bad request - invalid input parameters.
 *       409:
 *         description: Conflict - username or email already exists.
 */
router.post('/signup', userHandlers.signUp);


export default router;
