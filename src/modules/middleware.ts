import { param, validationResult } from "express-validator"
import { resolve } from "path"
import { Router } from 'express'
import prisma from "./db"


export const handleInputError = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next();
}


export const isStaff = (req, res, next) => {
    if (req.user && req.user.role === 'STAFF') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied: Staff only' });
};


export const isCustomer = (req, res, next) => {
    if (req.user && req.user.role === 'CUSTOMER') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied: Customers only' });
}


export const errorHandler = (error, req, res, next) => {
    console.error(error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'An error occurred on the server.';
    res.status(statusCode).json({ message });
};


export const responseFormatter = (req, res, next) => {
    res.formattedJson = (status, data, message = '') => {
        res.status(status).json({
            message,
            data,
        });
    };
    next();
};


export const validateId = [
    param('id').isUUID().withMessage('ID must be a valid UUID'),
    handleInputError,
];


export const isCreator = async (req, res, next) => {
    const productId = req.params.id;
    const userId = req.user.id;

    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.creatorId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to modify or delete this product' });
        }
        next();
    } catch (error) {
        next(error);
    }
};
