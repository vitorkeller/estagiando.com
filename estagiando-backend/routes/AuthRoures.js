const router =
  require("express").Router();

const auth =
  require("../middlewares/Auth");

const authorize =
  require("../middlewares/Authorize");

const AuthController =
  require("../controllers/AuthController");

router.post(
  "/register",
  AuthController.register
);

router.post(
  "/login",
  AuthController.login
);

router.post(
  "/refresh",
  AuthController.refresh
);

router.post(
  "/logout",
  AuthController.logout
);

router.get(
  "/profile",
  auth,
  (req, res) => {
    res.json(req.user);
  }
);

router.get(
  "/admin",
  auth,
  authorize("COORDINATOR"),
  (req, res) => {
    res.json({
      message:
        "Área administrativa"
    });
  }
);

module.exports = router;