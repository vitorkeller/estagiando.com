const express = require("express");
const router = express.Router();

const AuditLogController =
    require("../controllers/AuditLogController");

const auth = require("../middlewares/Auth");
const authorize = require("../middlewares/Authorize");

router.get(
    "/audit-logs",
    auth,
    authorize("COORDINATOR"),
    AuditLogController.findAll
);

router.get(
    "/audit-logs/:entity/:entityId",
    auth,
    authorize("COORDINATOR"),
    AuditLogController.findByEntity
);

module.exports = router;