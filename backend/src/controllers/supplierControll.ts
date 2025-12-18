/**
 * Controller for Supplliers
 */

import { Request, Response } from 'express'

import { prisma } from '../lib/prisma.js'

// GET /suppliers
const index = async (res: Response) => {
    const suppliers = await prisma.supplier.findMany()
    return res.json(suppliers)
}

// GET /suppliers/:id
const show = async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    const supplier = await prisma.supplier.findUnique({
        where: { id: id }
    })

    return res.json(supplier)
}

// POST /suppliers
const create = async (req: Request, res: Response) => {
    const { name, cnpj, email, phone, address } = req.body
    const supplier = await prisma.supplier.create({
        data: {
            name,
            cnpj,
            email,
            phone,
            address
        }
    })

    return res.status(201).json(supplier)
}

// PUT /supplier/:id
const update = async (req: Request, res: Response) => {
    const { name, cnpj, email, phone, address } = req.body

    const id = Number(req.params.id)

    const supplier = await prisma.supplier.update({
        where: { id: id },
        data: {
            name,
            cnpj,
            email,
            phone,
            address
        }
    })

    return res.json(supplier)
}

// DELETE /supplier/:id
const destroy = async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    await prisma.supplier.delete({
        where: { id: id }
    })

    return res.status(204).send()
}

export { index, show, create, update, destroy }