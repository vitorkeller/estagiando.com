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
	"/pending",
	auth,
	authorize("COORDINATOR"),
	InternshipController.findPending
);

router.get(
	"/:id",
	auth,
	InternshipController.findById
);


router.patch(
	"/:id/approve",
	auth,
	authorize("COORDINATOR"),
	InternshipController.approve
);

router.patch(
	"/:id/reject",
	auth,
	authorize("COORDINATOR"),
	InternshipController.reject
);

router.delete(
	"/:id",
	auth,
	authorize("COORDINATOR"),
	InternshipController.delete
);

module.exports = router;
