import { describe, it, expect } from "vitest";

import request from "supertest";

import { app } from "../../server.js";

describe("Dashboard Controller", () => {
  it("should return status 200 and all statistics", async () => {
    // test here
    const response = await request(app)
      .get("/dashboard")
      .set("Authorization", "Bearer SEU_TOKEN_AQUI")
      .expect(200);

    expect(response.body).toHaveProperty("totalProducts");
    expect(response.body).toHaveProperty("totalCategories");
  });
});
