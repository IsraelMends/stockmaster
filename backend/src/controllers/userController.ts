/**
 * Controller for Users
 */

import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";

const index = async (req: Request, res: Response) => {
  const { search } = req.query

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;
  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  const total = await prisma.user.count({ where });
  const totalPages = Math.ceil(total / limit);

  const users = await prisma.user.findMany({
    skip: skip,
    take: limit,
    where,
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

  if (existEmail && existEmail.id !== id) {
    return res.status(400).json({ error: 'Email is already in use' })
  }

  const updateUser = await prisma.user.findUnique({
    where: {
      id: id
    },
  })

  if (!updateUser) {
    return res.status(404).json({ error: 'User not found' })
  }

  const updateData: any = {}
  if (name) updateData.name = name
  if (email) updateData.email = email
  if (role) updateData.role = role
  if (active !== undefined) updateData.active = active
  if (password) {
    updateData.password = await bcrypt.hash(password, 10)
  }


  const updatedUser = await prisma.user.update({
    where: { id: id },
    data: updateData
  })

  const { password: _, ...userWithoutPassword } = updatedUser

  return res.json(userWithoutPassword)
}

const destroy = async (req: Request, res: Response) => {
  const userId = Number(req.params.id)

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  // Soft delete: desativar em vez de deletar
  await prisma.user.update({
    where: { id: userId },
    data: { active: false }
  })

  return res.status(204).send()
}

export { index, show, update, destroy }