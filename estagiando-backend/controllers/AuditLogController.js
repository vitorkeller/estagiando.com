const AuditLogService =
    require("../services/AuditLogService");

class AuditLogController {

    async findAll(req, res) {

        try {

            const result =
                await AuditLogService.findAll();

            return res.json(result);

        } catch (err) {

            return res
                .status(500)
                .json({
                    message: err.message
                });
        }
    }

    async findByEntity(req, res) {

        try {

            const result =
                await AuditLogService.findByEntity(
                    req.params.entity,
                    req.params.entityId
                );

            return res.json(result);

        } catch (err) {

            return res
                .status(500)
                .json({
                    message: err.message
                });
        }
    }
}

module.exports =
    new AuditLogController();