import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const index = async (req: Request, res: Response) => {
  const totalProducts = await prisma.product.count();
  const totalCategories = await prisma.category.count();
  const totalSuppliers = await prisma.supplier.count();
  const totalUnreadAlerts = await prisma.alert.count({
    where: {
      read: false,
    },
  });

  const allProducts = await prisma.product.findMany();
  const lowStockCount = allProducts.filter(
    (p: { currentStock: number; minimumStock: number }) =>
      p.currentStock <= p.minimumStock
  ).length;

  const recentMovements = await prisma.stockMoviment.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true } },
      user: { select: { name: true } },
    },
  });

  const totalStockValue = allProducts.reduce(
    (sum: number, p: { currentStock: number; costPrice: number }) =>
      sum + p.currentStock * p.costPrice,
    0
  );

  return res.json({
    totalCategories,
    totalProducts,
    totalSuppliers,
    totalUnreadAlerts,
    lowStockCount,
    recentMovements,
    totalStockValue,
  });
};

export { index };
