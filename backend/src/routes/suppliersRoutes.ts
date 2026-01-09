import { Router } from "express";

import {
  index,
  show,
  create,
  update,
  destroy,
} from "../controllers/supplierController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

import {
  createSupplierSchema,
  updateSupplierSchema,
} from "../validations/suppliersValidation.js";

import { validate } from "../middlewares/validationMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/suppliers", index);

router.get("/suppliers/:id", show);

router.post("/suppliers", validate(createSupplierSchema), create);

router.put("/suppliers/:id", validate(updateSupplierSchema), update);

router.delete("/suppliers/:id", destroy);

export { router };
