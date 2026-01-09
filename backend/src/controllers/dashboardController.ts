import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const index = async (req: Request, res: Response) => {
  // Estatísticas básicas
  const totalProducts = await prisma.product.count();
  const totalCategories = await prisma.category.count();
  const totalSuppliers = await prisma.supplier.count();
  const totalUnreadAlerts = await prisma.alert.count({
    where: {
      read: false,
    },
  });

  const allProducts = await prisma.product.findMany({
    include: {
      category: true,
    },
  });
  
  const lowStockCount = allProducts.filter(
    (p: { currentStock: number; minimumStock: number }) =>
      p.currentStock <= p.minimumStock
  ).length;

  const totalStockValue = allProducts.reduce(
    (sum: number, p: { currentStock: number; costPrice: number }) =>
      sum + p.currentStock * p.costPrice,
    0
  );

  // Movimentações por período
  const now = new Date();
  
  // Hoje (início do dia)
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  // Semana (7 dias atrás)
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);
  
  // Mês (primeiro dia do mês)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);

  const movementsToday = await prisma.stockMoviment.count({
    where: {
      createdAt: { gte: todayStart },
    },
  });

  const movementsThisWeek = await prisma.stockMoviment.count({
    where: {
      createdAt: { gte: weekStart },
    },
  });

  const movementsThisMonth = await prisma.stockMoviment.count({
    where: {
      createdAt: { gte: monthStart },
    },
  });

  // Estatísticas de movimentações por tipo
  const totalEntries = await prisma.stockMoviment.count({
    where: { type: "ENTRY" },
  });

  const totalExits = await prisma.stockMoviment.count({
    where: { type: "EXIT" },
  });

  const totalAdjustments = await prisma.stockMoviment.count({
    where: { type: "ADJUSTMENT" },
  });

  // Produtos mais movimentados
  const allMovements = await prisma.stockMoviment.findMany({
    include: {
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Agrupar por produto e contar
  const productMovementsCount: { [key: number]: { count: number; name: string } } = {};
  
  allMovements.forEach((movement) => {
    const productId = movement.productId;
    if (!productMovementsCount[productId]) {
      productMovementsCount[productId] = {
        count: 0,
        name: movement.product.name,
      };
    }
    productMovementsCount[productId].count++;
  });

  // Converter para array, ordenar e pegar top 5
  const topProducts = Object.entries(productMovementsCount)
    .map(([productId, data]) => ({
      productId: Number(productId),
      name: data.name,
      movementsCount: data.count,
    }))
    .sort((a, b) => b.movementsCount - a.movementsCount)
    .slice(0, 5);

  // Valor por categoria
  const valueByCategory: { [key: number]: { name: string; value: number } } = {};
  
  allProducts.forEach((product) => {
    const categoryId = product.categoryId;
    const value = product.currentStock * product.costPrice;
    
    if (!valueByCategory[categoryId]) {
      valueByCategory[categoryId] = {
        name: product.category.name,
        value: 0,
      };
    }
    valueByCategory[categoryId].value += value;
  });

  // Converter para array e ordenar por valor
  const categoryValues = Object.entries(valueByCategory)
    .map(([categoryId, data]) => ({
      categoryId: Number(categoryId),
      categoryName: data.name,
      totalValue: data.value,
    }))
    .sort((a, b) => b.totalValue - a.totalValue);

  // Movimentações recentes
  const recentMovements = await prisma.stockMoviment.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true } },
      user: { select: { name: true } },
    },
  });

  return res.json({
    // Estatísticas básicas
    totalCategories,
    totalProducts,
    totalSuppliers,
    totalUnreadAlerts,
    lowStockCount,
    totalStockValue,
    
    // Movimentações por período
    movementsByPeriod: {
      today: movementsToday,
      thisWeek: movementsThisWeek,
      thisMonth: movementsThisMonth,
    },
    
    // Estatísticas de movimentações
    movementsByType: {
      entries: totalEntries,
      exits: totalExits,
      adjustments: totalAdjustments,
    },
    
    // Produtos mais movimentados
    topProducts,
    
    // Valor por categoria
    valueByCategory: categoryValues,
    
    // Movimentações recentes
    recentMovements,
  });
};

export { index };
