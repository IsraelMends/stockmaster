import { Router } from 'express'
import { index, show, create, update, destroy } from '../controllers/categoryController.js'

const router = Router();

router.get('/categories', index)

router.get('/categories/:id', show)

router.post('/categories', create)

router.put('/categories/:id', update)

router.delete('/categories/:id', destroy)

export { router }