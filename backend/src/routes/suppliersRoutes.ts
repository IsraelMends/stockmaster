import { Router } from 'express'

import { index, show, create, update, destroy } from '../controllers/supplierControll.js'

const router = Router()

router.get('/suppliers', index)

router.get('/suppliers/:id', show)

router.post('/suppliers', create)

router.put('/suppliers/:id', update)

router.delete('/suppliers/:id', destroy)

export { router }