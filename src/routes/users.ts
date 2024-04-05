import { Router } from 'express';
import * as userHandlers from '../handlers/user';


const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           readOnly: true
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the user
 *         username:
 *           type: string
 *           description: The username of the user
 *         password:
 *           type: string
 *           description: The password hash of the user
 *         role:
 *           type: string
 *           description: The role of the user
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was last updated
 */


/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The current user's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', (req, res) => {
    userHandlers.me(req, res);
});


/**
 * @swagger
 * /api/users/{id}/change-password:
 *   post:
 *     summary: Change a user's password
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmNewPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/change-password', (req, res) => {
    userHandlers.changePassword(req, res);
});


/**
 * @swagger
 * /api/users/{id}/validate-password:
 *   post:
 *     summary: Validate the current user's password
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password is correct
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/validate-password', (req, res) => {
    userHandlers.validatePassword(req, res);
});


/**
 * @swagger
 * /api/users/{id}/update-me:
 *   put:
 *     summary: Update the current user's profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 */
router.put('/:id/update-me', (req, res) => {
    userHandlers.updateMe(req, res);
});


/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', (req, res) => {
    userHandlers.deleteUser(req, res);
});

export default router;
