const express = require("express");
const router = express.Router();
const MovieGenre = require("../models/movieGenre");
const Movie = require("../models/movie");
const Genre = require("../models/genre");

// Récupérer toutes les relations films-genres
router.get("/", async (req, res) => {
  try {
    const moviesGenres = await MovieGenre.findAll();
    res.json(moviesGenres);
  } catch (err) {
    console.error("❌ ERREUR GET /movies-genres :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Associer un genre à un film
router.post("/", async (req, res) => {
  try {
    const { id_movie, id_genre } = req.body;

    // Vérifier si les IDs existent dans la BDD
    const movie = await Movie.findByPk(id_movie);
    const genre = await Genre.findByPk(id_genre);

    if (!movie) return res.status(400).json({ error: "Film non trouvé avec l'ID : " + id_movie });
    if (!genre) return res.status(400).json({ error: "Genre non trouvé avec l'ID : " + id_genre });

    const newMovieGenre = await MovieGenre.create({ id_movie, id_genre });
    res.status(201).json(newMovieGenre);
  } catch (err) {
    console.error("❌ ERREUR SQL POST /movies-genres :", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

module.exports = router;

/**
 * @swagger
 * /movies-genres:
 *   get:
 *     summary: Récupérer toutes les relations films-genres
 *     tags: [MoviesGenres]
 *     responses:
 *       200:
 *         description: Liste des relations films-genres.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_movie:
 *                     type: integer
 *                     description: ID du film.
 *                   id_genre:
 *                     type: integer
 *                     description: ID du genre.
 *       500:
 *         description: Erreur serveur.
 * 
 *   post:
 *     summary: Associer un genre à un film
 *     tags: [MoviesGenres]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_movie:
 *                 type: integer
 *                 description: ID du film.
 *               id_genre:
 *                 type: integer
 *                 description: ID du genre.
 *     responses:
 *       201:
 *         description: Relation ajoutée avec succès.
 *       400:
 *         description: Film ou genre non trouvé.
 *       500:
 *         description: Erreur serveur.
 */