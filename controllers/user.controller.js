const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const User = require("../models/user.model");

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

  const user = await User.findOne({ where: { id: userId } });

  if (!user) {
    return next(new AppError("No user with given id", 404));
  }

  await User.destroy({ where: { id: userId } });

  //todo
  //delete all post of the user
  //delete images from cloudinary

  return res.status(200).json({
    status: "success",
    msg: "User Deleted Succesfully!",
  });
});
