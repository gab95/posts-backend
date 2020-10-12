const express = require("express");
const router = express.Router();

const postsController = require("../controllers/posts.controller");

const {
  validarJWT,
  validarMismoUsuario,
} = require("../middlewares/verify-jwt");

router.use(validarJWT);

router
  .route("/")
  .post(postsController.createPost)
  .get(postsController.getAllPostsByUSer);

router
  .route("/:postId")
  .patch(validarMismoUsuario, postsController.editPost)
  .delete(validarMismoUsuario, postsController.deletePost);

router.get("/all", postsController.getPostsFromOtherUsers);

module.exports = router;