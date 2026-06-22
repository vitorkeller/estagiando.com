const express = require("express");
const router = express.Router();

const UserController =
    require("../controllers/UserController");

const auth = require("../middlewares/Auth");
const authorize = require("../middlewares/Authorize");

router.post(
    "/",
    auth,
    authorize("COORDINATOR"),
    UserController.create
);

router.get(
    "/",
    auth,
    authorize("COORDINATOR"),
    UserController.findAll
);

router.get(
    "/:id",
    auth,
    authorize("COORDINATOR"),
    UserController.findById
);

router.put(
    "/:id",
    auth,
    authorize("COORDINATOR"),
    UserController.update
);

router.patch(
    "/:id/activate",
    auth,
    authorize("COORDINATOR"),
    UserController.activate
);

router.patch(
    "/:id/deactivate",
    auth,
    authorize("COORDINATOR"),
    UserController.deactivate
);

module.exports = router;