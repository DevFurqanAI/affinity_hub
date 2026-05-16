import ApiError from "../utils/ApiError.js";

/*
|--------------------------------------------------------------------------
| Validation Middleware
|--------------------------------------------------------------------------
| This middleware validates req.body, req.params, and req.query using Zod.
|
| Example usage:
| validate({
|   body: someBodySchema,
|   params: someParamsSchema,
|   query: someQuerySchema
| })
*/

const formatZodErrors = (zodError) => {
  return zodError.issues.map((issue) => {
    const fieldName = issue.path.length > 0 ? issue.path.join(".") : "field";

    return {
      field: fieldName,
      message: issue.message
    };
  });
};

const validate = (schema) => {
  return (req, res, next) => {
    try {
      if (schema.body) {
        const result = schema.body.safeParse(req.body);

        if (!result.success) {
          throw new ApiError(
            400,
            "Validation failed",
            formatZodErrors(result.error)
          );
        }

        req.body = result.data;
      }

      if (schema.params) {
        const result = schema.params.safeParse(req.params);

        if (!result.success) {
          throw new ApiError(
            400,
            "Validation failed",
            formatZodErrors(result.error)
          );
        }

        req.params = result.data;
      }

      if (schema.query) {
        const result = schema.query.safeParse(req.query);

        if (!result.success) {
          throw new ApiError(
            400,
            "Validation failed",
            formatZodErrors(result.error)
          );
        }

        req.query = result.data;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validate;