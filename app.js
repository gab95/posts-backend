require("dotenv").config();

const path = require("path");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const uuid = require("uuid").v4;

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/error.controller");

const authRoutes = require("./routes/auth.routes");
const postsRoutes = require("./routes/posts.routes");
const userRoutes = require("./routes/user.routes");

const db = require("./config/database");

var cloudinary = require("cloudinary").v2;

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//test db
db.authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    db.sync();
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

//multer config
const storage = multer.diskStorage({
  destination: path.join(__dirname, "public/img/uploads"),
  filename: (req, file, cb, filename) => {
    console.log(file);
    cb(null, uuid() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(multer({ storage, fileFilter }).single("image"));

//cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});

//app routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/users", userRoutes);

//handling routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//handling errors
app.use(globalErrorHandler);

//bootstrap the app!
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT} !`);
});
