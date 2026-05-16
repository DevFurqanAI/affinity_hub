import { v2 as cloudinary } from "cloudinary";

import env from "./env.js";

if (
  !env.cloudinaryCloudName ||
  !env.cloudinaryApiKey ||
  !env.cloudinaryApiSecret
) {
  console.warn(
    "Cloudinary credentials are missing. Avatar upload will not work until they are added."
  );
}

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret
});

export default cloudinary;