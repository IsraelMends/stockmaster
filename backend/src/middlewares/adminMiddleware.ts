import { Request, Response, NextFunction } from "express";

import { prisma } from "../lib/prisma.js";

const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.userId;

  if (!id) {
    return res.status(401).json({
      error: "User not authenticated",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: id },
  });

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  if (user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Access denied. Admin role required",
    });
  }

  next();
};

export { adminMiddleware };
