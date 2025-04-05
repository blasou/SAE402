const request = require("supertest");
const app = require("../src/app");

describe("🎭 API /api/actors", () => {
  it("GET /api/actors should return actors list", async () => {
    const res = await request(app).get("/api/actors");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
