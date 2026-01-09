/**
 * Controller for Products
 */

import { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

// GET /products
const index = async (req: Request, res: Response) => {
  const { categoryId, supplierId, active, search } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;
  const where: any = {};

  // Filter by category
  if (categoryId) {
    where.categoryId = Number(categoryId);
  }

  // Filter by supplier
  if (supplierId) {
    where.supplierId = Number(supplierId);
  }

  // Filter by active/inactive
  if (active !== undefined) {
    where.active = active === "true";
  }

  // Search by name or barcode
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { barcode: { contains: search as string } }
    ];
  }

  const total = await prisma.product.count({ where });
  const totalPages = Math.ceil(total / limit);

  const products = await prisma.product.findMany({
    skip: skip,
    take: limit,
    where,
    include: {
      category: true,
      supplier: true
    }
  });

  return res.json({
    data: products,
    pagination: {
      page: page, //actual page
      limit: limit, // items per page
      total: total, // total items
      totalPages: totalPages, // total pages
    },
  });
};

// GET /products/:id
const show = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const products = await prisma.product.findUnique({
    where: { id: id },
  });

  return res.json(products);
};

// POST /products
const create = async (req: Request, res: Response) => {
  const {
    name,
    barcode,
    description,
    costPrice,
    salePrice,
    currentStock,
    minimumStock,
    unit,
    categoryId,
    supplierId,
    active,
  } = req.body;
  const category = await prisma.product.create({
    data: {
      name,
      barcode,
      description,
      costPrice,
      salePrice,
      currentStock,
      minimumStock,
      unit,
      categoryId,
      supplierId,
      active,
    },
  });

  return res.json(category);
};

// PUT /products/:id
const update = async (req: Request, res: Response) => {
  const {
    name,
    barcode,
    description,
    costPrice,
    salePrice,
    currentStock,
    minimumStock,
    unit,
    categoryId,
    supplierId,
    active,
  } = req.body;
  const id = Number(req.params.id);

  const resProduct = await prisma.product.update({
    where: { id: id },
    data: {
      name,
      barcode,
      description,
      costPrice,
      salePrice,
      currentStock,
      minimumStock,
      unit,
      categoryId,
      supplierId,
      active,
    },
  });

  return res.status(201).json(resProduct);
};

// DELETE /products/:id
const destroy = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.product.delete({
    where: { id: id },
  });

  return res.status(204).send();
};

export { index, show, create, update, destroy };
