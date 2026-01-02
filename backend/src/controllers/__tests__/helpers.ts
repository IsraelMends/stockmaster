import { prisma } from "../../lib/prisma.js";
import request from "supertest";
import { app } from "../../server.js";
import bcrypt from "bcryptjs";

//Helpers to create user
export async function createTestUser(data?: {
  name?: string;
  email?: string;
  password?: string;
  role?: "ADMIN" | "OPERATOR";
}) {
  //Define default value
  const defaultData = {
    name: 'Test User',
    email: `test${Date.now()}@test.com`,
    password: 'test123',
    role: 'OPERATOR' as const
  }

  const userData = { ...defaultData, ...data }

  const hashedPassword = await bcrypt.hash(userData.password, 10)

  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role
    }
  })

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

//Helper to get token
export async function getAuthToken(email: string, password: string) {
  const response = await request(app)
    .post('/auth/login')
    .send({ email, password })
    .expect(200)


  return response.body.token
}
