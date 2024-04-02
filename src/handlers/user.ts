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
