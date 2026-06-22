const { DataTypes } = require("sequelize");
const sequelize =
    require("../config/database");


const Internship =
    sequelize.define("Internship", {

        companyName: {
            type: DataTypes.STRING,
            allowNull: false
        },

        companyCnpj: {
            type: DataTypes.STRING,
            allowNull: false
        },

        supervisorName: {
            type: DataTypes.STRING,
            allowNull: false
        },

        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },

        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },

        weeklyWorkload: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        status: {
            type: DataTypes.ENUM(
                "UNDER_REVIEW",
                "APPROVED",
                "REJECTED",
                "ACTIVE",
                "FINISHED"
            ),
            defaultValue:
                "UNDER_REVIEW"
        }
    });


module.exports = Internship;