import { Router } from "express";

import { index, show, update, destroy } from "../controllers/userController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { validate } from "../middlewares/validationMiddleware.js";
import { updateUserSchema } from "../validations/userValidation.js";



const router = Router()

router.use(authMiddleware);

router.get('/users', index)

router.get('/users/:id', show)

router.put('/users/:id', adminMiddleware, validate(updateUserSchema), update)

router.delete('/users/:id', adminMiddleware, destroy)

export { router }