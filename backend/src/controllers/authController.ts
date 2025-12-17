import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const register = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body

    const itEmailExists = await prisma.user.findUnique({
        where: { email: email }
    })

    if (itEmailExists) {
        return res.status(400).json({ error: 'Email is already exists' })
    }

    const hashedPass = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPass,
            role
        }
    })

    const { password: _, ...userWithoutPassword } = user
    return res.status(201).json(userWithoutPassword)
}

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body

    const itUserExist = await prisma.user.findUnique({
        where: { email: email }
    })

    if (!itUserExist) {
        return res.status(400).json({ error: 'Invalid email or password' })
    }

    const passwordMatch = await bcrypt.compare(password, itUserExist.password)

    if (!passwordMatch) {
        return res.status(400).json({ error: 'The Password is not Match' })
    }

    const token = jwt.sign(
        { userId: itUserExist.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    )

    const { password: _, ...userWithoutPassword } = itUserExist
    return res.json({ user: userWithoutPassword, token })
}

export { register, login }