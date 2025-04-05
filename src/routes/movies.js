const express = require("express");
const router = express.Router();
const Movie = require("../models/movie");
const Actor = require("../models/actor"); // On importe le modèle Actor

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Récupérer tous les films
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Liste des films.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID du film.
 *                   title:
 *                     type: string
 *                     description: Titre du film.
 *                   year:
 *                     type: integer
 *                     description: Année de sortie du film.
 *       500:
 *         description: Erreur serveur.
 * 
 *   post:
 *     summary: Ajouter un nouveau film
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titre du film.
 *               year:
 *                 type: integer
 *                 description: Année de sortie du film.
 *     responses:
 *       201:
 *         description: Film ajouté avec succès.
 *       400:
 *         description: Erreur de validation.
 * 
 * /movies/{id}/actors:
 *   get:
 *     summary: Récupérer les acteurs d'un film
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du film
 *     responses:
 *       200:
 *         description: Liste des acteurs du film.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID de l'acteur.
 *                   name:
 *                     type: string
 *                     description: Nom de l'acteur.
 *       404:
 *         description: Aucun acteur trouvé pour ce film.
 *       500:
 *         description: Erreur serveur.
 */

// Récupérer tous les films
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.findAll();
    res.status(200).json(movies);
  } catch (err) {
    console.error("❌ ERREUR GET /movies :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer les acteurs d'un film
router.get("/:id/actors", async (req, res) => {
  try {
    const movieId = req.params.id;
    const actors = await Actor.findAll({
      include: {
        model: Movie,
        through: { where: { id_movie: movieId } },
      },
    });
    res.json(actors);
  } catch (err) {
    console.error("❌ ERREUR GET /movies/:id/actors :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// Ajouter un film
router.post("/", async (req, res) => {
  try {
    const newMovie = await Movie.create(req.body);
    res.status(201).json(newMovie);
  } catch (err) {
    console.error("❌ ERREUR POST /movies :", err);
    res.status(400).json({ error: "Impossible d'ajouter le film", details: err.message });
  }
});

module.exports = router;
