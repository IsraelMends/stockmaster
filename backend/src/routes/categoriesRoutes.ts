import { Router } from 'express'
import { index, show, create, update, destroy } from '../controllers/categoryController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = Router();

router.get('/categories', index)

router.get('/categories/:id', show)

router.post('/categories', authMiddleware, create)

router.put('/categories/:id', authMiddleware, update)

router.delete('/categories/:id', authMiddleware, destroy)

export { router }