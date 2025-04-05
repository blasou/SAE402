const express = require("express");
const router = express.Router();
const Game = require("../models/game");

/**
 * @swagger
 * /leaderboard:
 *   get:
 *     summary: Récupérer le classement des joueurs
 *     tags: [Leaderboard]
 *     responses:
 *       200:
 *         description: Classement des joueurs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID de la partie.
 *                   score:
 *                     type: integer
 *                     description: Score de la partie.
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Date de création de la partie.
 *       500:
 *         description: Erreur serveur.
 */
router.get("/", async (req, res) => {
  try {
    const leaderboard = await Game.findAll({
      attributes: ["id", "score", "createdAt"],
      order: [["score", "DESC"]],
      limit: 10, // Limiter à 10 meilleurs scores
    });
    res.json(leaderboard);
  } catch (err) {
    console.error("❌ ERREUR GET /leaderboard :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;