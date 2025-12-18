import { Router } from "express";

import {
  index,
  show,
  create,
  update,
  destroy,
} from "../controllers/supplierControll.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

import {
  createSupplierSchema,
  updateSupplierSchema,
} from "../validations/suppliersValidation.js";

import { validate } from "../middlewares/validationMiddleware.js";

const router = Router();

router.get("/suppliers", index);

router.get("/suppliers/:id", show);

router.post(
  "/suppliers",
  authMiddleware,
  validate(createSupplierSchema),
  create
);

router.put(
  "/suppliers/:id",
  authMiddleware,
  validate(updateSupplierSchema),
  update
);

router.delete("/suppliers/:id", authMiddleware, destroy);

export { router };
