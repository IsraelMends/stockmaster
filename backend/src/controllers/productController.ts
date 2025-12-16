/**
 * Controller for Products
 */

import { Request, Response } from 'express'

import { prisma } from '../lib/prisma.js'


// GET /products
const index = async (req: Request, res: Response) => {
    const products = await prisma.product.findMany()
    return res.json(products)
}

// GET /products/:id
const show = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const products = await prisma.product.findUnique({
        where: { id: id }
    })

    return res.json(products)
}

// POST /products
const create = async (req: Request, res: Response) => {
    const { name, barcode, description, costPrice, salePrice, currentStock, minimumStock, unit, categoryId, supplierId, active } = req.body
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
            active
        }
    })

    return res.json(category)
}

// PUT /products/:id
const update = async (req: Request, res: Response) => {

    const { name, barcode, description, costPrice, salePrice, currentStock, minimumStock, unit, categoryId, supplierId, active } = req.body
    const id = Number(req.params.id)

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
            active
        }
    })

    return res.status(201).json(resProduct)
}

// DELETE /products/:id
const destroy = async (req: Request, res: Response) => {

    const id = Number(req.params.id)
    const resProduct = await prisma.product.delete({
        where: { id: id }
    })

    return res.status(204).send()
}

export { index, show, create, update, destroy }