const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Actor = sequelize.define("Actor", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "actors",
  timestamps: false,
});

module.exports = Actor;