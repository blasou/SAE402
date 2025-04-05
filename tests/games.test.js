const request = require("supertest");
const app = require("../src/app");

describe("🎮 API /api/game", () => {
  let movieId;

  it("GET /api/game/start should return game data or 404", async () => {
    const res = await request(app).get("/api/game/start");
    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("movieId");
      expect(res.body).toHaveProperty("clues");
      movieId = res.body.movieId;
    }
  });

  it("POST /api/game/guess should validate guess", async () => {
    if (!movieId) return;

    const res = await request(app)
      .post("/api/game/guess")
      .send({ movieId, guessTitle: "Un titre aléatoire" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("correct");
  });

  it("POST /api/game/guess with missing data should return 400", async () => {
    const res = await request(app)
      .post("/api/game/guess")
      .send({});

    expect(res.statusCode).toBe(400);
  });
});
