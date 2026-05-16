import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { searchUsers, searchPosts } from "../controllers/search.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/users", searchUsers);

router.get("/posts", searchPosts);

export default router;