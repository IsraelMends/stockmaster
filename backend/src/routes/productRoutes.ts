import { Router } from 'express'
import { index, show, create, update, destroy } from '../controllers/productController.js'

const router = Router()

router.get('/products', index)

router.get('/products/:id', show)

router.post('/products', create)

router.put('/products/:id', update)

router.delete('/products/:id', destroy)

export { router }