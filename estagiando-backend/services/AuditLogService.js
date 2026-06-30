const AuditLog = require("../models/AuditLog");

class AuditLogService {

    async log({ entity, entityId, action, user, details = null }) {

        await AuditLog.create({
            entity,
            entityId,
            action,
            performedBy: user.id,
            performedByRole: user.role,
            details
        });
    }
}

module.exports = new AuditLogService();
