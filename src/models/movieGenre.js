const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Définissez la table de jonction
const MovieGenre = sequelize.define("MovieGenre", {
  id_movie: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: "movies", key: "id" }, // Assurez-vous que "movies" est le nom exact de la table
  },
  id_genre: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: "genres", key: "id" }, // Assurez-vous que "genres" est le nom exact de la table
  },
}, {
  tableName: "MoviesGenres", // Assurez-vous que ce nom correspond à la table dans la base de données
  timestamps: false,
});

module.exports = MovieGenre;