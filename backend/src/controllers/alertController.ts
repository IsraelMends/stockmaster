import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const index = async (req: Request, res: Response) => {
  
  // Catch filters in query string
  const { read, type } = req.query;

  // Create a empty object
  const where: any = {};

  // If read has been passed, add to where 
  if (read !== undefined) {
    where.read = read === "true";
  }

  // If type has been passed, add to where
  if (type) {
    where.type = type;
  }

  // Search alerts
  const alerts = await prisma.alert.findMany({
    where,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          currentStock: true,
          minimumStock: true,
          unit: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.json(alerts);
};
