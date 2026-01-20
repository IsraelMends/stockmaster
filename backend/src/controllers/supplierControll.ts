/**
 * Controller for Supplliers
 */

import { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

// GET /suppliers
const index = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;
  const total = await prisma.supplier.count();

  const totalPages = Math.ceil(total / limit);

  const suppliers = await prisma.supplier.findMany({
    skip: skip,
    take: limit,
  });
  return res.json({
    data: suppliers,
    pagination: {
      page: page,
      limit: limit,
      total: total,
      totalPages: totalPages,
    },
  });
};

// GET /suppliers/:id
const show = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const supplier = await prisma.supplier.findUnique({
    where: { id: id },
  });

  return res.json(supplier);
};

// POST /suppliers
const create = async (req: Request, res: Response) => {
  const { name, cnpj, email, phone, address } = req.body;
  const supplier = await prisma.supplier.create({
    data: {
      name,
      cnpj,
      email,
      phone,
      address,
    },
  });

  return res.status(201).json(supplier);
};

// PUT /supplier/:id
const update = async (req: Request, res: Response) => {
  const { name, cnpj, email, phone, address } = req.body;

  const id = Number(req.params.id);

  const supplier = await prisma.supplier.update({
    where: { id: id },
    data: {
      name,
      cnpj,
      email,
      phone,
      address,
    },
  });

  return res.json(supplier);
};

// DELETE /supplier/:id
const destroy = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  await prisma.supplier.delete({
    where: { id: id },
  });

  return res.status(204).send();
};

export { index, show, create, update, destroy };
