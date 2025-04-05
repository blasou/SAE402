const request = require("supertest");
const app = require("../src/app");

describe("🏷️ API /api/genres", () => {
  it("GET /api/genres should return genres list", async () => {
    const res = await request(app).get("/api/genres");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
