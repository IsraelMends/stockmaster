/**
 * Controller for Users
 */

import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const index = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;
  const total = await prisma.user.count();

  const totalPages = Math.ceil(total / limit);

  const users = await prisma.user.findMany({
    skip: skip,
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.json({
    data: users,
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

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  return res.json(user);
};

// update, destroy and validation to authorization for users

const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { name, email, role, active, password } = req.body

  if (!id) {
    return res.status(404).json({ error: 'User not found' })
  }

  const existEmail = await prisma.user.findUnique({
    where: {
      email: email
    }
  })

  const updateUser = await prisma.user.findUnique({
    where: {
      id: id
    }
  })



}