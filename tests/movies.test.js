const request = require("supertest");
const app = require("../src/app");

describe("🎬 API /api/movies", () => {
  it("GET /api/movies should return movies list", async () => {
    const res = await request(app).get("/api/movies");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
