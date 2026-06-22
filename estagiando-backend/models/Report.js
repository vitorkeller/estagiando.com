const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Report = sequelize.define("Report", {

    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    attachmentUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },

    status: {
        type: DataTypes.ENUM(
            "PENDING",
            "APPROVED",
            "REJECTED"
        ),
        defaultValue: "PENDING"
    },

    evaluatorComment: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    evaluatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

module.exports = Report;