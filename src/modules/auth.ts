import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export const comparePassword = (password, hash) => {
    return bcrypt.compare(password, hash)
}

export const hashPassword = (password) => {
    return bcrypt.hash(password, 10)
}

export const createJWT = (user) => {
    const token = jwt.sign({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    },
    process.env.JWT_SECRET,
    )
    return token
}

export const protect = (req, res, next) => {
    const Bearer = req.headers.authorization

    if (!Bearer || !Bearer.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized Access' })
    }

    const token = Bearer.split('Bearer ')[1]

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log(err)
            res.status(401)
            res.json({ message: 'Invalid or Expired Token' })
            return
         }
        req.user = decoded
        next()
    })

}

