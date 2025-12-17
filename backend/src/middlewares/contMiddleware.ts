import { Request, Response, NextFunction } from 'express'

let requestCount = 0

export const countMiddleware = (req: Request, res: Response, next: NextFunction) => {
    requestCount++

    console.log(`Total de requisições: ${requestCount}`)

    next()
}