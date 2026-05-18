import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";

import env from "./config/env.js";
import ApiResponse from "./utils/ApiResponse.js";
import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import followRoutes from "./routes/follow.routes.js";
import postRoutes from "./routes/post.routes.js";
import likeRoutes from "./routes/like.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import searchRoutes from "./routes/search.routes.js";
import storyRoutes from "./routes/story.routes.js";
import interestRoutes from "./routes/interest.routes.js";
import reportRoutes from "./routes/report.routes.js";
import banRoutes from "./routes/ban.routes.js";
import blockRoutes from "./routes/block.routes.js";

const app = express();

app.use(helmet());

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        service: "Affinity Hub API",
        status: "running"
      },
      "Health check successful"
    )
  );
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/interests", interestRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/bans", banRoutes);
app.use("/api/blocks", blockRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;