// index.js
const app = require("./src/app");
const sequelize = require("./src/config/database");
const Stats = require("./src/models/stats");

const PORT = process.env.PORT || 3000;

async function initializeStats() {
  try {
    const stats = await Stats.findOne();
    if (!stats) {
      await Stats.create({ gamesPlayed: 0, totalPlayTime: 0 });
      console.log("✅ Statistiques initialisées dans la base de données.");
    } else {
      console.log("✅ Statistiques chargées depuis la base de données.");
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation des statistiques :", err);
  }
}

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion à la base de données réussie !");
    await sequelize.sync({ alter: true });
    console.log("✅ Modèles synchronisés avec la base de données");
    await initializeStats();
    app.listen(PORT, () => console.log(`✅ Serveur démarré sur le port ${PORT}`));
  } catch (err) {
    console.error("❌ Erreur lors du démarrage du serveur :", err);
  }
}

startServer();
