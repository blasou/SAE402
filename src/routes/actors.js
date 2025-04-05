const express = require("express");
const router = express.Router();
const Actor = require("../models/actor"); // On importe le modèle Actor
const Movie = require("../models/movie");

/**
 * @swagger
 * tags:
 *   name: Actors
 *   description: Gestion des acteurs
 */

/**
 * @swagger
 * /actors:
 *   get:
 *     summary: Récupérer tous les acteurs
 *     tags: [Actors]
 *     responses:
 *       200:
 *         description: Liste des acteurs.
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
 *       500:
 *         description: Erreur serveur.
 */
router.get("/", async (req, res) => {
  try {
    const actors = await Actor.findAll();
    res.json(actors);
  } catch (err) {
    console.error("❌ ERREUR GET /actors :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer les films d'un acteur
router.get("/:id/movies", async (req, res) => {
  try {
    const actorId = req.params.id;
    console.log("🔍 ID de l'acteur :", actorId);

    const movies = await Movie.findAll({
      attributes: ["id", "title"], // Inclure explicitement les champs nécessaires
      include: {
        model: Actor,
        through: { attributes: [], where: { id_actor: actorId } }, // Filtrer par id_actor
      },
    });

    console.log("🎥 Films trouvés :", movies);

    if (!movies || movies.length === 0) {
      return res.status(404).json({ error: "Aucun film trouvé pour cet acteur." });
    }

    res.json(movies);
  } catch (err) {
    console.error("❌ ERREUR GET /actors/:id/movies :", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

/**
 * @swagger
 * /actors:
 *   post:
 *     summary: Ajouter un nouvel acteur
 *     tags: [Actors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de l'acteur.
 *     responses:
 *       201:
 *         description: Acteur ajouté avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID de l'acteur.
 *                 name:
 *                   type: string
 *                   description: Nom de l'acteur.
 *       400:
 *         description: Erreur de validation.
 */
router.post("/", async (req, res) => {
  try {
    const newActor = await Actor.create(req.body);
    res.status(201).json(newActor);
  } catch (err) {
    console.error("❌ ERREUR POST /actors :", err);
    res.status(400).json({ error: "Impossible d'ajouter l'acteur", details: err.message });
  }
});

module.exports = router;
