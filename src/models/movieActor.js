const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MovieActor = sequelize.define("MovieActor", {
  id_movie: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: "movies", key: "id" },
  },
  id_actor: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: "actors", key: "id" },
  },
}, {
  tableName: "MoviesActors", // Assurez-vous que ce nom correspond à la table dans la base de données
  timestamps: false, // Désactiver les colonnes createdAt et updatedAt
});

module.exports = MovieActor;