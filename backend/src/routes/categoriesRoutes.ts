import { Router } from "express";

import {
  index,
  show,
  create,
  update,
  destroy,
} from "../controllers/categoryController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

import {
  createCategorySchema,
  updateCategorySchema,
} from "../validations/categoryValidation.js";

import { validate } from "../middlewares/validationMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/categories", index);

router.get("/categories/:id", show);

router.post("/categories", validate(createCategorySchema), create);

router.put("/categories/:id", validate(updateCategorySchema), update);

router.delete("/categories/:id", destroy);

export { router };
