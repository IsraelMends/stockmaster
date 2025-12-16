/**
 * Controller for Categories
 */

import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'

// GET /categories
const index = async (req: Request, res: Response) => {
    const categoryResponse = await prisma.category.findMany()
    return res.json(categoryResponse)
}

//Function to Search by Id
const show = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const idResponse = await prisma.category.findUnique({
        where: { id: id }
    })

    return res.json(idResponse)
}

//Function to Create
const create = async (req: Request, res: Response) => {
    const { name, description } = req.body
    const category = await prisma.category.create({
        data: {
            name,
            description
        }
    })
    return res.status(201).json(category)
}

//Function to Update
const update = async (req: Request, res: Response) => {
    const { name, description } = req.body
    const id = Number(req.params.id)
    const category = await prisma.category.update({
        where: { id: id },
        data: { name, description }
    })

    return res.json(category)
}

//Function to Delete
const destroy = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    await prisma.category.delete({
        where: { id: id }
    })

    return res.status(204).send()
}

export { index, show, create, update, destroy }