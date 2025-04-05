const express = require("express");
const router = express.Router();
const Genre = require("../models/genre");

/**
 * @swagger
 * /genres:
 *   get:
 *     summary: Récupérer tous les genres
 *     tags: [Genres]
 *     responses:
 *       200:
 *         description: Liste des genres.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID du genre.
 *                   genre:
 *                     type: string
 *                     description: Nom du genre.
 *       500:
 *         description: Erreur serveur.
 * 
 *   post:
 *     summary: Ajouter un nouveau genre
 *     tags: [Genres]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               genre:
 *                 type: string
 *                 description: Nom du genre.
 *     responses:
 *       201:
 *         description: Genre ajouté avec succès.
 *       400:
 *         description: Erreur de validation.
 */

// Récupérer tous les genres
router.get("/", async (req, res) => {
  try {
    const genres = await Genre.findAll();
    res.json(genres);
  } catch (err) {
    console.error("❌ ERREUR GET /genres :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Ajouter un genre
router.post("/", async (req, res) => {
  try {
    const newGenre = await Genre.create(req.body);
    res.status(201).json(newGenre);
  } catch (err) {
    console.error("❌ ERREUR POST /genres :", err);
    res.status(400).json({ error: "Impossible d'ajouter le genre", details: err.message });
  }
});

module.exports = router;
