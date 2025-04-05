const express = require("express");
const router = express.Router();
const MovieActor = require("../models/movieActor");
const Movie = require("../models/movie");
const Actor = require("../models/actor");

/**
 * @swagger
 * /movies-actors:
 *   get:
 *     summary: Récupérer toutes les relations films-acteurs
 *     tags: [MoviesActors]
 *     responses:
 *       200:
 *         description: Liste des relations films-acteurs.
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
 *                   id_actor:
 *                     type: integer
 *                     description: ID de l'acteur.
 *       500:
 *         description: Erreur serveur.
 * 
 *   post:
 *     summary: Associer un acteur à un film
 *     tags: [MoviesActors]
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
 *               id_actor:
 *                 type: integer
 *                 description: ID de l'acteur.
 *     responses:
 *       201:
 *         description: Relation ajoutée avec succès.
 *       400:
 *         description: Film ou acteur non trouvé.
 *       500:
 *         description: Erreur serveur.
 */

// Récupérer toutes les relations films-acteurs
router.get("/", async (req, res) => {
  try {
    const moviesActors = await MovieActor.findAll();
    res.json(moviesActors);
  } catch (err) {
    console.error("❌ ERREUR GET /movies-actors :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Associer un acteur à un film
router.post("/", async (req, res) => {
  try {
    const { id_movie, id_actor } = req.body;

    // Vérifier si les IDs existent dans la BDD
    const movie = await Movie.findByPk(id_movie);
    const actor = await Actor.findByPk(id_actor);

    if (!movie) return res.status(400).json({ error: "Film non trouvé avec l'ID : " + id_movie });
    if (!actor) return res.status(400).json({ error: "Acteur non trouvé avec l'ID : " + id_actor });

    const newMovieActor = await MovieActor.create({ id_movie, id_actor });
    res.status(201).json(newMovieActor);
  } catch (err) {
    console.error("❌ ERREUR SQL POST /movies-actors :", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

module.exports = router;
