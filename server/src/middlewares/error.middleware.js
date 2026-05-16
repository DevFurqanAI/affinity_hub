import ApiError from "../utils/ApiError.js";
import env from "../config/env.js";

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    error = new ApiError(statusCode, message, error.errors || [], error.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors || []
  };

  if (env.nodeEnv === "development") {
    response.stack = error.stack;
  }

  return res.status(error.statusCode).json(response);
};

export default errorMiddleware;