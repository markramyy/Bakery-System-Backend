import prisma from "../modules/db"
import { comparePassword, createJWT, hashPassword } from "../modules/auth"


export const signUp = async (req, res) => {
    const { username, email, password, role } = req.body

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
            role
        }
    })

    const token = createJWT(user)
    res.status(201)
    res.json({
        message: 'User has been created successfully',
        token: token
    });
}

export const signIn = async (req, res) => {
    const { username, password } = req.body

    const user = await prisma.user.findUnique({
        where: {
            username
        }
    })

    const passwordMatch = await comparePassword(password, user.password)

    if (!passwordMatch && !user) {
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
}
