const jwt = require("jsonwebtoken");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const User = require("../models/user.model");

const signToken = (email, id) => {
  return jwt.sign({ email, id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.email, user.id);

  return res.status(statusCode).json({
    status: "success",
    token,
    userId: user.id,
    role: user.role,
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { email, password, name, lastname } = req.body;

  if (!email || !password || !name || !lastname) {
    return next(new AppError("Please provide all fields required", 400));
  }

  const newUser = await User.create({ email, password, name, lastname });

  return res.status(200).json({
    status: "success",
    newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findByCredentials(email, password);

  if (!user) {
    return next(new AppError("Wrong email or password, try again!", 403));
  } else {
    createSendToken(user, 200, res);
  }
});
