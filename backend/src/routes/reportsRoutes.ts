import { Router } from "express";
import {
  lowStock,
  movements,
  productsByCategory,
} from "../controllers/reportsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/reports/low-stock", lowStock);
router.get("/reports/movements", movements);
router.get("/reports/products-by-category", productsByCategory);

export { router };
