import prisma from "../modules/db"

import { comparePassword, createJWT, hashPassword } from "../modules/auth"


export const signUp = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Check if email or username already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ],
            },
        });

        if (existingUser) {
            let message = 'Email already exists, try another one.';
            if (existingUser.username === username) {
                message = 'Username already exists, try another one.';
            }
            res.status(409).json({ message }); // 409 Conflict
            return;
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role,
            },
        });

        const token = createJWT(user);
        res.status(201).json({
            message: 'User has been created successfully',
            token: token,
        });
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong', error: error.message });
    }
};


export const signIn = async (req, res) => {
    const { username, password } = req.body

    try{
        const user = await prisma.user.findUnique({
            where: {
                username
            }
        })

        if (!user) {
            res.status(401)
            res.json({ message: 'Invalid Credentials' })
            return
        }

        const passwordMatch = await comparePassword(password, user.password)

        if (!passwordMatch) {
            res.status(401)
            res.json({ message: 'Invalid Credentials' })
            return
        }

        const token = createJWT(user)
        res.status(200)
        res.json({
            message: 'User has Logged in successfully',
            token: token
        });
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong', error: error.message });
    }
}


export const me = async (req, res) => {
    const user = req.user
    res.status(200).json(user)
}


export const updateMe = async (req, res) => {
    const user = req.user
    const { username, email } = req.body

    try {
        const updatedUser = await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                username,
                email,
            }
        })

        res.status(200)
        res.json(updatedUser)
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong', error: error.message });
    }
}


export const changePassword = async (req, res) => {
    const user = req.user
    const { oldPassword, newPassword, confirmNewPassword } = req.body

    try {
        const currentUser = await prisma.user.findUnique({
            where: {
                id: user.id
            }
        })

        const passwordMatch = await comparePassword(oldPassword, currentUser.password)

        if (!passwordMatch) {
            res.status(401)
            res.json({ message: 'Invalid Credentials' })
            return
        }

        if (newPassword !== confirmNewPassword) {
            res.status(400)
            res.json({ message: 'Passwords did not match' })
            return
        }

        const newPasswordMatch = await comparePassword(newPassword, currentUser.password)

        if (newPasswordMatch) {
            res.status(400)
            res.json({ message: 'New password should be different from the old password' })
            return
        }

        const hashedPassword = await hashPassword(newPassword)

        const updatedUser = await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                password: hashedPassword
            }
        })

        res.status(200)
        res.json({
            message: 'Password has been changed successfully',
            user: updatedUser
        })
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong', error: error.message });
    }
}


export const validatePassword = async (req, res) => {
    const user = req.user
    const { password } = req.body

    try {
        const currentUser = await prisma.user.findUnique({
            where: {
                id: user.id
            }
        })

        const passwordMatch = await comparePassword(password, currentUser.password)

        if (!passwordMatch) {
            res.status(401)
            res.json({ message: 'Invalid Credentials. Password did not match!' })
            return
        }

        res.status(200)
        res.json({ message: 'Password is correct' })
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong', error: error.message });
    }
}


export const deleteUser = async (req, res) => {
    const user = req.user
    const { password } = req.body

    try {
        const currentUser = await prisma.user.findUnique({
            where: {
                id: user.id
            }
        })

        const passwordMatch = await comparePassword(password, currentUser.password)

        if (!passwordMatch) {
            res.status(401)
            res.json({ message: 'Invalid Credentials' })
            return
        }

        await prisma.user.delete({
            where: {
                id: user.id
            }
        })

        res.status(200)
        res.json({ message: 'User has been deleted successfully, Loging Out...' })
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong', error: error.message });
    }
}
