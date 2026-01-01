import { describe, it, expect } from "vitest";

import request from "supertest";

import { app } from "../../server.js";

describe("Dashboard Controller", () => {
  it("should return status 200 and all statistics", async () => {
    // test here
    const response = await request(app)
      .get("/dashboard")
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2NzI5MTY3NSwiZXhwIjoxNzY3ODk2NDc1fQ.gU-hIzoJ_xdNtfMn-j00Tj11Otf33h0PWO_1IkdfxQM"
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
