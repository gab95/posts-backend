const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");

const { validarJWT, validarAdminRole } = require("../middlewares/verify-jwt");

router.use([validarJWT, validarAdminRole]);

router
  .route("/:userId")
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
