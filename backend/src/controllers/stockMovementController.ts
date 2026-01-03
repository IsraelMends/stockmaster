import { Request, Response } from "express";
import { checkAndCreateLowStockAlert } from "../services/alertServices.js";

import { prisma } from "../lib/prisma.js";

const create = async (req: Request, res: Response) => {
  const { productId, type, reason, quantity, notes } = req.body;
  const userId = req.userId!;

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const previousStock = product.currentStock;

  let currentStock: number;

  if (type === "ENTRY") {
    currentStock = previousStock + quantity;
  } else if (type === "EXIT") {
    currentStock = previousStock - quantity;
  } else {
    currentStock = quantity;
  }

  if (type === "EXIT" && currentStock < 0) {
    return res.status(400).json({
      error: "The Stock is insufficient",
    });
  }

  const movement = await prisma.stockMoviment.create({
    data: {
      productId,
      userId,
      type,
      reason,
      quantity,
      previousStock,
      currentStock,
      notes,
    },
  });

  await prisma.product.update({
    where: { id: productId },
    data: { currentStock },
  });

  //Here because stock is already updated
  await checkAndCreateLowStockAlert(productId);

  return res.status(201).json(movement);
};

const index = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;
  const total = await prisma.stockMoviment.count();

  const totalPages = Math.ceil(total / limit);

  const movement = await prisma.stockMoviment.findMany({
    skip: skip,
    take: limit,
    include: {
      product: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.json({
    data: movement,
    pagination: {
      page: page,
      limit: limit,
      total: total,
      totalPages: totalPages,
    },
  });
};

const show = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const movement = await prisma.stockMoviment.findUnique({
    where: { id: id },
    include: {
      product: true,
      user: true,
    },
  });

  if (!movement) {
    return res.status(404).json({ error: "Movement not found" });
  }

  return res.json(movement);
};

export { create, index, show };
