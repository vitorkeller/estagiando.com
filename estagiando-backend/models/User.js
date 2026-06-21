const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  role: {
    type: DataTypes.ENUM(
      "STUDENT",
      "ADVISOR",
      "COORDINATOR",
      "ADMIN"
    ),
    defaultValue: "STUDENT"
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },

  advisorId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

module.exports = User;