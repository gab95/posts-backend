const jwt = require("jsonwebtoken");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

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

exports.validarMismoUsuario = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const id = req.params.postId;

  //check if post exist
  const post = await Post.findOne({
    where: { id },
  });

  if (post.userId === userId) {
    next();
  } else {
    return next(
      new AppError("You do not have privileges to perform this action", 403)
    );
  }
});
