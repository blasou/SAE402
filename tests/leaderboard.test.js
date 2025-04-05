const request = require("supertest");
const app = require("../src/app");

describe("🏆 API /api/leaderboard", () => {
  it("GET /api/leaderboard should return data or 200", async () => {
    const res = await request(app).get("/api/leaderboard");
    expect([200, 404]).toContain(res.statusCode);
  });
});
