const ErrorResponse = require("./utilities/errorReponse");

// Express Middleware Error Handler
const errorHandler = (error, request, response, next) => {
  console.log(error);
  // spread error properties to err
  let err = { ...error };
  err.message = error.message;

  // Id (ObjectId) doesn't exist
  if (error.name === "CastError") {
    const message = `Resource not found`;
    err = new ErrorResponse(message, 404);
  }

  // Duplicate fields (not unique)
  if (error.code === 11000) {
    const message = "Duplicate fields identified.";
    err = new ErrorResponse(message, 400);
  }

  // Validation
  if (error.name === "ValidationError") {
    const message = Object.values(error.errors).map((er) => er.message);
    err = new ErrorResponse(message, 400);
  }

  response.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Server Error.",
  });
};

module.exports = errorHandler;
