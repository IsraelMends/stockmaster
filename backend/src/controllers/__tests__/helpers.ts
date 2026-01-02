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
    name:'Test User',
    email:`test${Date.now()}@test.com`,
    password:'test123'
  }
}

//Helper to get token
export async function getAuthToken(email: string, password: string) {}
