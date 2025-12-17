import { Router } from 'express'

import { index, show, create, update, destroy } from '../controllers/supplierControll.js'

import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/suppliers', index)

router.get('/suppliers/:id', show)

router.post('/suppliers', authMiddleware, create)

router.put('/suppliers/:id', authMiddleware, update)

router.delete('/suppliers/:id', authMiddleware, destroy)

export { router }