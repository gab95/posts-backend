const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const cloudinary = require("cloudinary").v2;

const User = require("../models/user.model");
const Post = require("../models/post.model");

exports.getUserById = catchAsync(async (req, res, next) => {
  let user = await User.findAll({
    where: { id: req.userId },
    attributes: ["id", "email", "name", "lastname"],
  });

  if (!user) {
    return next(new AppError("No user with given id", 404));
  }

  return res.status(200).json({
    status: "success",
    user,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { email, password, name, lastname, role } = req.body;

  const user = await User.findOne({ where: { id: userId } });

  if (!user) {
    return next(new AppError("No user with given id", 404));
  }

  await User.update(
    {
      email,
      password,
      name,
      lastname,
      role,
    },
    { where: { id: userId }, individualHooks: true }
  );

  return res.status(200).json({
    status: "success",
    msg: "User Updated Successfully!!",
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const userIdForDelete = req.userIdForDelete;

  const user = await User.findOne({ where: { id: userId } });

  if (!user) {
    return next(new AppError("No user with given id", 404));
  }

  //delete images from cloudinary first
  //1. get all publicId from DB
  let postsForDelete = await Post.findAll({
    where: { userId: userIdForDelete },
    attributes: ["publicId"],
  });

  //2. map the result to get an array of publicIds from user's posts
  postsForDelete = postsForDelete.map((post) => post.dataValues.publicId);
  await cloudinary.api.delete_resources(postsForDelete);

  //onDelete:'cascade' in user model,
  //3. deletes all records to the foreing key
  await User.destroy({ where: { id: userId } });

  return res.status(200).json({
    status: "success",
    msg: "User Deleted Succesfully within all their posts!",
  });
});
