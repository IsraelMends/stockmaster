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

  return res.json({
    totalCategories,
    totalProducts,
    totalSuppliers,
    totalUnreadAlerts,
    lowStockCount,
  });
};
