const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");

const {
  validarJWT,
  validarAdminRole,
  validarMismoUsuarioUsers,
} = require("../middlewares/verify-jwt");

router
  .route("/:userId")
  .get(validarJWT, userController.getUserById)
  .patch(validarJWT, userController.updateUser)
  .delete(
    [validarJWT, validarAdminRole],
    validarMismoUsuarioUsers,
    userController.deleteUser
  );

module.exports = router;
