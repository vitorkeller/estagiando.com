const express = require("express");
const router = express.Router();

const UserController =
    require("../controllers/UserController");

const auth = require("../middlewares/Auth");
const authorize = require("../middlewares/Authorize");

router.post(
    "/",
    auth,
    authorize("ADMIN"),
    UserController.create
);

router.get(
    "/",
    auth,
    authorize("ADMIN"),
    UserController.findAll
);

router.get(
    "/:id",
    auth,
    authorize("ADMIN"),
    UserController.findById
);

router.put(
    "/:id",
    auth,
    authorize("ADMIN"),
    UserController.update
);

router.patch(
    "/:id/activate",
    auth,
    authorize("ADMIN"),
    UserController.activate
);

router.patch(
    "/:id/deactivate",
    auth,
    authorize("ADMIN"),
    UserController.deactivate
);

module.exports = router;