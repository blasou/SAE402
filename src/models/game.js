// filepath: /Users/blase/Desktop/SAE402/src/models/game.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Game = sequelize.define("Game", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  graphData: {
    type: DataTypes.TEXT, // Stocker les données du graphe en JSON
    allowNull: false,
    get() {
      return JSON.parse(this.getDataValue("graphData"));
    },
    set(value) {
      this.setDataValue("graphData", JSON.stringify(value));
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "games",
  timestamps: false,
});

module.exports = Game;