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
  const { productId, userId, type, reason, startDate, endDate } = req.query;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;
  const where: any = {};

  // Filter by product
  if (productId) {
    where.productId = Number(productId);
  }

  // Filter by user
  if (userId) {
    where.userId = Number(userId);
  }

  // Filter by movement type
  if (type) {
    where.type = type;
  }

  // Filter by reason
  if (reason) {
    where.reason = reason;
  }

  // Filter by date range
  if (startDate || endDate) {
    // Validar formato da data (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (startDate && !dateRegex.test(startDate as string)) {
      return res.status(400).json({
        error: "Invalid startDate format. Use YYYY-MM-DD",
      });
    }
    
    if (endDate && !dateRegex.test(endDate as string)) {
      return res.status(400).json({
        error: "Invalid endDate format. Use YYYY-MM-DD",
      });
    }
    
    // Validar se as datas são válidas
    if (startDate) {
      const start = new Date(startDate as string);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          error: "Invalid startDate. Please provide a valid date",
        });
      }
    }
    
    if (endDate) {
      const end = new Date(endDate as string);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          error: "Invalid endDate. Please provide a valid date",
        });
      }
    }
    
    // Validar se startDate não é maior que endDate
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (start > end) {
        return res.status(400).json({
          error: "startDate cannot be greater than endDate",
        });
      }
    }
    
    where.createdAt = {};
    
    if (startDate) {
      // Início do dia (00:00:00)
      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
      where.createdAt.gte = start;
    }
    
    if (endDate) {
      // Final do dia (23:59:59.999)
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const total = await prisma.stockMoviment.count({ where });
  const totalPages = Math.ceil(total / limit);

  const movement = await prisma.stockMoviment.findMany({
    skip: skip,
    take: limit,
    where,
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
