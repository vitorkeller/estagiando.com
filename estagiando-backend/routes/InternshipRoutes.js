const router =
	require("express").Router();

const auth =
	require("../middlewares/Auth");

const authorize =
	require("../middlewares/Authorize");

const InternshipController =
	require("../controllers/InternshipController");
    

router.post(
    "/internships",
    auth,
    InternshipController.create
);

router.get(
    "/internships",
    auth,
    InternshipController.findAll
);

router.get(
    "/internships/pending",
    auth,
    authorize("COORDINATOR"),
    InternshipController.findPending
);

router.get(
    "/internships/ready-for-final-decision",
    auth,
    authorize("COORDINATOR"),
    InternshipController.findReadyForFinalDecision
);

router.get(
    "/internships/:id",
    auth,
    InternshipController.findById
  );

router.post(
	"/interships",
	auth,
	InternshipController.create
);


router.patch(
    "/internships/:id/approve",
    auth,
    authorize("COORDINATOR"),
    InternshipController.approve
);

router.patch(
    "/internships/:id/reject",
    auth,
    authorize("COORDINATOR"),
    InternshipController.reject
);

router.patch(
    "/internships/:id/finalize",
    auth,
    authorize("COORDINATOR"),
    InternshipController.finalize
);

router.patch(
    "/internships/:id/deny",
    auth,
    authorize("COORDINATOR"),
    InternshipController.deny
 );


module.exports = router;
