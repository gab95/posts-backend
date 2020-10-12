const AppError = require("../utils/AppError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  //api
  if (req.originalUrl.startsWith("/api")) {
    //operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    //Programming or other unknown error: dont leak error details
    console.error("***/// ERROR", err);
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    // console.log('NOMBRE ERROR MONGOOSE dev', err.name);
    console.log(err);
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { name: err.name, ...err };
    error.message = err.message;
    // console.log('NOMBRE ERROR MONGOOSE prod', error.name);
    console.log(err);

    sendErrorProd(error, req, res);
  }
};
