const router =
    require("express").Router();

const auth =
    require("../middlewares/Auth");

const authorize =
    require("../middlewares/Authorize");

const InternshipController =
    require("../controllers/InternshipController");

router.post(
    "/",
    auth,
    InternshipController.create
);

router.get(
    "/",
    auth,
    InternshipController.findAll
);

router.get(
    "/:id",
    auth,
    InternshipController.findById
);

router.get(
    "/pending",
    auth,
    authorize("ADMIN"),
    InternshipController.findPending
);

router.patch(
    "/:id/approve",
    auth,
    authorize("ADMIN"),
    InternshipController.approve
);

router.patch(
    "/:id/reject",
    auth,
    authorize("ADMIN"),
    InternshipController.reject
);

router.delete(
    "/:id",
    auth,
    authorize("ADMIN"),
    InternshipController.delete
);

module.exports = router;