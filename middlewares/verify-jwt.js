const fs = require("fs-extra");

const jwt = require("jsonwebtoken");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const User = require("../models/user.model");
const Post = require("../models/post.model");
const { Op } = require("sequelize");

exports.validarJWT = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("No token in the request", 401));
  }

  const { email, id } = jwt.verify(token, process.env.JWT_SECRET);

  req.userId = id;

  next();
};

exports.validarAdminRole = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findByPk(userId);

  // console.log(user);

  if (!user) {
    return next(new AppError("User does not exist!!!", 404));
  }

  if (user.role !== "admin") {
    return next(
      new AppError("You are not an Admin!, Try do something else...", 403)
    );
  }

  next();
});

exports.validarMismoUsuarioPosts = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const id = req.params.postId;

  //check if post exist
  const post = await Post.findOne({
    where: { id },
  });

  if (!post) {
    return next(new AppError("No post with given id", 404));
  }

  if (post.userId === userId) {
    req.post = post;
    next();
  } else {
    await fs.unlink(req.file.path);
    return next(
      new AppError("You do not have privileges to perform this action", 403)
    );
  }
});

exports.validarMismoUsuarioUsers = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const id = req.params.userId;

  //check if user exist
  const user = await User.findByPk(userId);

  if (!user) {
    return next(new AppError("No user with given id", 404));
  }

  if (user.id !== id) {
    req.userIdForDelete = id;
    next();
  } else {
    return next(new AppError("You cannot delete yourself!!!", 400));
  }
});
