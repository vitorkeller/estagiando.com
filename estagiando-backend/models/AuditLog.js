const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AuditLog = sequelize.define("AuditLog", {

    entity: {
        type: DataTypes.STRING,
        allowNull: false
    },

    entityId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    action: {
        type: DataTypes.STRING,
        allowNull: false
    },

    performedBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    performedByRole: {
        type: DataTypes.STRING,
        allowNull: false
    },

    details: {
        type: DataTypes.JSON,
        allowNull: true
    }

}, {

    updatedAt: false,
    hooks: {

        beforeUpdate: () => {
            throw new Error(
                "Registros de auditoria são imutáveis"
            );
        },

        beforeDestroy: () => {
            throw new Error(
                "Registros de auditoria não podem ser removidos"
            );
        }
    }
});

module.exports = AuditLog;