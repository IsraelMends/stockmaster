/**
 * Reports Controller
 */

import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { convertToCSV, flattenObject } from "../utils/csvExporter.js";

// GET /reports/low-stock - Relatório de produtos com estoque baixo
const lowStock = async (req: Request, res: Response) => {
  const allProducts = await prisma.product.findMany({
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    where: {
      active: true,
    },
  });

  // Filtrar produtos com estoque baixo
  const lowStockProducts = allProducts.filter(
    (product) => product.currentStock <= product.minimumStock
  );

  // Formatar dados do relatório
  const report = lowStockProducts.map((product) => ({
    productId: product.id,
    productName: product.name,
    currentStock: product.currentStock,
    minimumStock: product.minimumStock,
    unit: product.unit,
    difference: product.minimumStock - product.currentStock,
    category: {
      id: product.category.id,
      name: product.category.name,
    },
    supplier: {
      id: product.supplier.id,
      name: product.supplier.name,
    },
    costPrice: product.costPrice,
    salePrice: product.salePrice,
  }));

  // Verificar formato de exportação
  const format = req.query.format as string;

  if (format === "csv") {
    // Achatizar objetos aninhados para CSV
    const flattenedData = report.map((item) => flattenObject(item));
    const csv = convertToCSV(flattenedData);
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=low-stock-products.csv");
    return res.send(csv);
  }

  return res.json({
    total: report.length,
    data: report,
  });
};

// GET /reports/movements - Relatório de movimentações por período
const movements = async (req: Request, res: Response) => {
  const { startDate, endDate, type, reason } = req.query;

  // Validar datas
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

  const where: any = {};

  // Filtro por tipo
  if (type) {
    where.type = type;
  }

  // Filtro por motivo
  if (reason) {
    where.reason = reason;
  }

  // Filtro por data
  if (startDate || endDate) {
    where.createdAt = {};
    
    if (startDate) {
      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
      where.createdAt.gte = start;
    }
    
    if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const movements = await prisma.stockMoviment.findMany({
    where,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          unit: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Agrupar por tipo
  const byType: { [key: string]: number } = {};
  const byReason: { [key: string]: number } = {};
  let totalQuantity = 0;

  movements.forEach((movement) => {
    // Contar por tipo
    if (!byType[movement.type]) {
      byType[movement.type] = 0;
    }
    byType[movement.type]++;

    // Contar por motivo
    if (!byReason[movement.reason]) {
      byReason[movement.reason] = 0;
    }
    byReason[movement.reason]++;

    // Somar quantidades
    if (movement.type === "ENTRY") {
      totalQuantity += movement.quantity;
    } else if (movement.type === "EXIT") {
      totalQuantity -= movement.quantity;
    }
  });

  // Verificar formato de exportação
  const format = req.query.format as string;

  if (format === "csv") {
    // Achatizar objetos aninhados para CSV
    const flattenedData = movements.map((movement) => ({
      id: movement.id,
      productId: movement.productId,
      productName: movement.product.name,
      productUnit: movement.product.unit,
      userId: movement.userId,
      userName: movement.user.name,
      type: movement.type,
      reason: movement.reason,
      quantity: movement.quantity,
      previousStock: movement.previousStock,
      currentStock: movement.currentStock,
      notes: movement.notes || "",
      createdAt: movement.createdAt.toISOString(),
    }));
    
    const csv = convertToCSV(flattenedData);
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=movements-report.csv");
    return res.send(csv);
  }

  return res.json({
    period: {
      startDate: startDate || null,
      endDate: endDate || null,
    },
    summary: {
      totalMovements: movements.length,
      byType,
      byReason,
      netQuantity: totalQuantity,
    },
    data: movements,
  });
};

// GET /reports/products-by-category - Relatório de produtos por categoria
const productsByCategory = async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        where: {
          active: true,
        },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Formatar relatório
  const report = categories.map((category) => {
    const products = category.products;
    const totalProducts = products.length;
    const totalStockValue = products.reduce(
      (sum, product) => sum + product.currentStock * product.costPrice,
      0
    );
    const lowStockProducts = products.filter(
      (product) => product.currentStock <= product.minimumStock
    ).length;

    return {
      categoryId: category.id,
      categoryName: category.name,
      totalProducts,
      totalStockValue,
      lowStockProducts,
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        currentStock: product.currentStock,
        minimumStock: product.minimumStock,
        unit: product.unit,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        supplier: product.supplier,
      })),
    };
  });

  // Verificar formato de exportação
  const format = req.query.format as string;

  if (format === "csv") {
    // Para CSV, vamos criar uma linha por produto (não agrupado)
    const allProducts: any[] = [];
    
    report.forEach((category) => {
      category.products.forEach((product: any) => {
        allProducts.push({
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          productId: product.id,
          productName: product.name,
          currentStock: product.currentStock,
          minimumStock: product.minimumStock,
          unit: product.unit,
          costPrice: product.costPrice,
          salePrice: product.salePrice,
          supplierId: product.supplier.id,
          supplierName: product.supplier.name,
        });
      });
    });
    
    const csv = convertToCSV(allProducts);
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=products-by-category.csv");
    return res.send(csv);
  }

  return res.json({
    totalCategories: report.length,
    data: report,
  });
};

export { lowStock, movements, productsByCategory };