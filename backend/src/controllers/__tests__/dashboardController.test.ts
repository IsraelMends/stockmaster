import { describe, it, expect, beforeAll } from "vitest";

import request from "supertest";

import { app } from "../../server.js";

import { createTestUser, getAuthToken } from './helpers.js'

describe("Dashboard Controller", () => {
  let token: string

  beforeAll(async () => {
    const user = await createTestUser()
    token = await getAuthToken(user.email, 'test123')
  })

  it("should return status 200 and all statistics", async () => {
    // test here
    const response = await request(app)
      .get("/dashboard")
      .set(
        "Authorization",
        `Bearer ${token}`
      )
      .expect(200);

    expect(response.body).toHaveProperty("totalProducts");
    expect(response.body).toHaveProperty("totalCategories");
    expect(response.body).toHaveProperty("totalSuppliers");
    expect(response.body).toHaveProperty("totalUnreadAlerts");
    expect(response.body).toHaveProperty("lowStockCount");
    expect(response.body).toHaveProperty("recentMovements");
    expect(response.body).toHaveProperty("totalStockValue");

    expect(typeof response.body.totalProducts).toBe("number");
    expect(typeof response.body.totalCategories).toBe("number");

    expect(Array.isArray(response.body.recentMovements)).toBe(true);
  });
});
