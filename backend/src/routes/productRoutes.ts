import { Router } from "express";

import {
  index,
  show,
  create,
  update,
  destroy,
} from "../controllers/productController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

import {
  updateProductsSchema,
  createProductsSchema,
} from "../validations/productsValidation.js";

import { validate } from "../middlewares/validationMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/products", index);

router.get("/products/:id", show);

router.post("/products", validate(createProductsSchema), create);

router.put("/products/:id", validate(updateProductsSchema), update);

router.delete("/products/:id", destroy);

export { router };
