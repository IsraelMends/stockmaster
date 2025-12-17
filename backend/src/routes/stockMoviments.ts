import { create, index, show } from '../controllers/stockMovimentController.js'
import { Router } from 'express'

const router = Router()

router.get('/stock-moviments', index)
router.get('/stock-moviments/:id', show)
router.post('/stock-moviments', create)

export { router }