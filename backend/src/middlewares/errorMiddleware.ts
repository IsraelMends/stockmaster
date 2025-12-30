import { Request, Response, NextFunction } from "express";

const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.code && err.code.startsWith("P")) {
    // Prisma error
    if (err.code === "P2025") {
      // Record not found
      return res.status(404).json({ error: "Record not found" });
    }
    if (err.code === "P2002") {
      // Duplicate Record
      return res.status(409).json({ error: "Duplicate record" });
    }
    //Another Prisma error
    return res.status(400).json({ error: "Database error" });
  }
  if (err.issues) {
    // Validation zod error
    return res.status(400).json({
      error: "Validation error",
      issues: err.issues,
    });
  }

  return res.status(500).json({
    error: err.message || "Internal server error",
  });
};

export { errorMiddleware };
