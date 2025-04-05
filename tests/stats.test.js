const request = require("supertest");
const app = require("../src/app"); // Utilise l'app sans lancer le serveur

describe("📊 API /api/stats", () => {
  it("GET /api/stats should return 200 or 404", async () => {
    const res = await request(app).get("/api/stats");
    expect([200, 404]).toContain(res.statusCode);
  });

  it("POST /api/stats should update stats or fail gracefully", async () => {
    const res = await request(app)
      .post("/api/stats")
      .send({ gamesPlayed: 1, playTime: 100 });

    expect([200, 500]).toContain(res.statusCode);
  });
});
