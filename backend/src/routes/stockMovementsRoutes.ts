import { create, index, show } from "../controllers/stockMovementController.js";

import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";

import { createStockMovementSchema } from "../validations/stockMovementValidation.js";

import { validate } from "../middlewares/validationMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/stock-movements", index);
router.get("/stock-movements/:id", show);
router.post(
  "/stock-movements",
  validate(createStockMovementSchema),
  create
);

export { router };
