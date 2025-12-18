import { Router } from 'express'

import { index, show, create, update, destroy } from '../controllers/categoryController.js'

import { authMiddleware } from '../middlewares/authMiddleware.js'

import { createCategorySchema } from '../validations/categoryValidation.js'
import { validate } from '../middlewares/validationMiddleware.js';

const router = Router();

router.get('/categories', index)

router.get('/categories/:id', show)

router.post('/categories', authMiddleware, validate(createCategorySchema), create)

router.put('/categories/:id', authMiddleware, validate(createCategorySchema), update)

router.delete('/categories/:id', authMiddleware, validate(createCategorySchema), destroy)

export { router }