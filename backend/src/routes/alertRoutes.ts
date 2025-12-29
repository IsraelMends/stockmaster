import { Router } from "express";
import {
  countUnread,
  destroy,
  index,
  markAllAsRead,
  markAsRead,
  show,
} from "../controllers/alertController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/alerts", index);
router.get("/alerts/unread/count", countUnread);
router.get("/alerts/:id", show);
router.patch("/alerts/:id/read", markAsRead);
router.patch("/alerts/read-all", markAllAsRead);
router.delete("/alerts/:id", destroy);

export { router };
