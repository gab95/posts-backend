const fs = require("fs-extra");
const cloudinary = require("cloudinary").v2;

const { Op } = require("sequelize");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const Post = require("../models/post.model");
const User = require("../models/user.model");

//subir imagen sin id de usuario
exports.createPost = catchAsync(async (req, res, next) => {
  const { caption } = req.body;

  const result = await cloudinary.uploader.upload(req.file.path, {
    transformation: [{ width: 600, height: 600 }],
  });

  const newPost = await Post.create({
    image: result.url,
    caption,
    userId: req.userId,
    publicId: result.public_id,
  });

  await fs.unlink(req.file.path);

  return res.status(200).json({
    status: "success",
    msg: "Post Uploaded Succesfully!",
  });
});

exports.getPostsFromOtherUsers = catchAsync(async (req, res, next) => {
  // find all posts that aren't the logged in user's posts
  const posts = await Post.findAll({
    where: {
      userId: { [Op.ne]: req.userId },
    },
    //attributes of the "Post" table
    attributes: ["image", "caption"],

    //include user model and return only name and lastname of the user who belongs the post
    include: [
      {
        model: User,
        attributes: ["name", "lastname"],
      },
    ],
  });

  return res.status(200).json({
    status: "success",
    posts,
  });
});
exports.getAllPostsByUSer = catchAsync(async (req, res, next) => {
  // const postsByUser = await Post.findAndCountAll();
  const { count, rows } = await Post.findAndCountAll({
    where: { userId: req.userId },
  });

  if (count === 0) {
    return next(
      new AppError("You have no posts to show, try uploading one!", 404)
    );
  }

  return res.status(200).json({
    status: "success",
    count,
    rows,
  });
});

exports.editPost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const { caption } = req.body;

  //delete the image post from cloudinary
  await cloudinary.uploader.destroy(postToUpdate.publicId);

  //upload to cloudinary the new image
  const result = await cloudinary.uploader.upload(req.file.path, {
    transformation: [{ width: 600, height: 600 }],
  });
  await fs.unlink(req.file.path);

  //update db row
  const updatedPost = await Post.update(
    { image: result.url, caption, publicId: result.public_id },
    { where: { id: postId } }
  );

  return res.status(200).json({
    status: "success",
    updatedPost,
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  const post = await Post.findOne({
    where: { id: postId, userId: req.userId },
  });

  if (!post) {
    return next(new AppError("No post with the given id!", 404));
  }

  await post.destroy();
  await cloudinary.uploader.destroy(post.publicId);

  return res.status(203).json({
    status: "success",
    msg: "Post deleted!",
  });
});
