const express = require("express");
const router = express.Router();

const ReportController =
    require("../controllers/ReportController");

const auth = require("../middlewares/Auth");
const authorize = require("../middlewares/Authorize");

router.post(
    "/reports",
    auth,
    authorize("STUDENT"),
    ReportController.create
);

router.get(
    "/internships/:internshipId/reports",
    auth,
    ReportController.findByInternship
);

router.get(
    "/reports/pending",
    auth,
    authorize("ADVISOR", "COORDINATOR"),
    ReportController.findPending
);

router.patch(
    "/reports/:id/evaluate",
    auth,
    authorize("ADVISOR", "COORDINATOR"),
    ReportController.evaluate
);

module.exports = router;