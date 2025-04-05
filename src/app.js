// src/app.js
const express = require("express");
const sequelize = require("./config/database");
const { Actor, Genre, Movie } = require("./models/associations");
const Stats = require("./models/stats");

const actorsRoutes = require("./routes/actors");
const genresRoutes = require("./routes/genres");
const moviesRoutes = require("./routes/movies");
const moviesActorsRoutes = require("./routes/moviesActors");
const moviesGenresRoutes = require("./routes/moviesGenres");
const leaderboardRoutes = require("./routes/leaderboard");
const setupSwagger = require("./config/swagger");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.static("public"));

// Configurer Swagger
setupSwagger(app);

// Routes
app.use("/api/actors", actorsRoutes);
app.use("/api/genres", genresRoutes);
app.use("/api/movies", moviesRoutes);
app.use("/api/movies-actors", moviesActorsRoutes);
app.use("/api/movies-genres", moviesGenresRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

const apiRouter = express.Router();

// Stats Routes
apiRouter.get("/stats", async (req, res) => {
  try {
    const stats = await Stats.findOne();
    if (!stats) return res.status(404).json({ error: "Statistiques non trouvées" });
    res.json(stats);
  } catch (err) {
    console.error("❌ ERREUR GET /stats :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

apiRouter.post("/stats", async (req, res) => {
  try {
    const { gamesPlayed, playTime } = req.body;
    const stats = await Stats.findOne();

    if (!stats) return res.status(500).json({ error: "Statistiques non initialisées." });

    if (gamesPlayed !== undefined) stats.gamesPlayed += gamesPlayed;
    if (playTime !== undefined) stats.totalPlayTime += playTime;

    await stats.save();
    res.status(200).json(stats);
  } catch (err) {
    console.error("❌ ERREUR POST /stats :", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

// Game Routes
apiRouter.get("/game/start", async (req, res) => {
  try {
    const randomMovie = await Movie.findOne({
      order: sequelize.random(),
      include: [
        { model: Actor, through: { attributes: [] } },
        { model: Genre, through: { attributes: [] } }
      ]
    });

    if (!randomMovie) return res.status(404).json({ error: "Aucun film disponible" });

    const gameData = {
      movieId: randomMovie.id,
      clues: {
        releaseYear: randomMovie.release_year,
        genres: randomMovie.Genres.map(g => g.name),
        actorsCount: randomMovie.Actors.length
      }
    };

    res.json(gameData);
  } catch (err) {
    console.error("❌ ERREUR GET /game/start :", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

apiRouter.post("/game/guess", async (req, res) => {
  try {
    const { movieId, guessTitle } = req.body;
    if (!movieId || !guessTitle) return res.status(400).json({ error: "ID du film et titre deviné requis" });

    const movie = await Movie.findByPk(movieId);
    if (!movie) return res.status(404).json({ error: "Film non trouvé" });

    const isCorrect = movie.title.toLowerCase() === guessTitle.toLowerCase();

    res.json({
      correct: isCorrect,
      title: isCorrect ? movie.title : null
    });
  } catch (err) {
    console.error("❌ ERREUR POST /game/guess :", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./public" });
});

app.use("*", (req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

module.exports = app;
