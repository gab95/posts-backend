const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");

const {
  validarJWT,
  validarAdminRole,
  validarMismoUsuarioUsers,
} = require("../middlewares/verify-jwt");

router.use([validarJWT, validarAdminRole]);

router
  .route("/:userId")
  .patch(userController.updateUser)
  .delete(validarMismoUsuarioUsers, userController.deleteUser);

module.exports = router;
