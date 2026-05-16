import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/*
|--------------------------------------------------------------------------
| Admin Middleware
|--------------------------------------------------------------------------
| This middleware must be used after verifyJWT.
| verifyJWT adds req.user.
*/

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }

  next();
});