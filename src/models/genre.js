const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const MovieGenre = require("./movieGenre");

const Genre = sequelize.define("Genre", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  genre: { 
    type: DataTypes.STRING, 
    allowNull: false 
  }
}, { 
  tableName: "genres", 
  timestamps: false 
});

Genre.hasMany(MovieGenre, { foreignKey: "id_genre" });

module.exports = Genre;