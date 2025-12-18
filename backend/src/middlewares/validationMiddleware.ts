import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body) //validate body
            next() // If valid, continue 
        } catch (error: any) {
            return res.status(400).json({
                error: 'Invalid datas',
                details: error.errors // Errors details by zod
            })
        }
    }
}