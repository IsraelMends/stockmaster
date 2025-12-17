import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

declare global {
    namespace Express {
        interface Request {
            userId?: number
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ error: 'Token is missing' })
    }

    const parts = authHeader.split(' ')

    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Token is invalid' })
    }

    const [scheme, token] = parts

    if (scheme !== 'Bearer') {
        return res.status(401).json({ error: 'Token is in bad format' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number }

        req.userId = decoded.userId

        next()
    } catch (error) {
        return res.status(401).json({ error: 'Token is invalid' })
    }

}