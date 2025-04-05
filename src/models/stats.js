const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Stats = sequelize.define("Stats", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  gamesPlayed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalPlayTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: "stats",
  timestamps: false,
});

module.exports = Stats;