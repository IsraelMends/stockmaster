import { Router } from "express";

import { index } from "../controllers/dashboardController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/dashboard", index);

export { router };
