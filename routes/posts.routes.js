const express = require("express");
const router = express.Router();

const postsController = require("../controllers/posts.controller");

const {
  validarJWT,
  validarMismoUsuarioPosts,
} = require("../middlewares/verify-jwt");

router.use(validarJWT);

router
  .route("/")
  .post(postsController.createPost)
  .get(postsController.getAllPostsByUSer);

router.get("/all", postsController.getPostsFromOtherUsers);

router
  .route("/:postId")
  .get(postsController.getPostById)
  .patch(validarMismoUsuarioPosts, postsController.editPost)
  .delete(validarMismoUsuarioPosts, postsController.deletePost);

module.exports = router;
