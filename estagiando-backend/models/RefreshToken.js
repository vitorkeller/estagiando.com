const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const RefreshToken = sequelize.define("RefreshToken", {
  token: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

User.hasMany(RefreshToken);

RefreshToken.belongsTo(User);

module.exports = RefreshToken;