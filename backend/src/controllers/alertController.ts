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

const show = async (req: Request, res: Response) => {
  const catchId = Number(req.params.id);

  const searchAlert = await prisma.alert.findUnique({
    where: {
      id: catchId,
    },
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
  });

  if (!searchAlert) {
    return res.status(404).json({ message: "Alert not found" });
  } else {
    return res.json(searchAlert);
  }
};

const markAsRead = async (req: Request, res: Response) => {
  const catchId = Number(req.params.id);

  const existAlert = await prisma.alert.findUnique({
    where: {
      id: catchId,
    },
  });

  if (!existAlert) {
    return res.status(404).json({ message: "Alert not found" });
  } else {
    const updatedAlert = await prisma.alert.update({
      where: {
        id: catchId,
      },
      data: {
        read: true,
      },
    });
    return res.json(updatedAlert);
  }
};
