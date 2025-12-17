import { Router } from 'express'
import { index, show, create, update, destroy } from '../controllers/productController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/products', index)

router.get('/products/:id', show)

router.post('/products', authMiddleware, create)

router.put('/products/:id', authMiddleware, update)

router.delete('/products/:id', authMiddleware, destroy)

export { router }