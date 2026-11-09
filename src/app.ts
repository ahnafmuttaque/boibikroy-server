import express from "express";
import { ApiResponse } from "@utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import feedbackRouter from "@modules/feedbacks/feedbacks.route.js";
import errorMiddleware from "@middlewares/error.middleware.js";
import authRouter from "@modules/auth/auth.route.js";
import adminRouter from "@modules/admin/admin.route.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import env from "@config/env.config.js";

const app = express();
const ApiVersionOne = "/api/v1";
const authRoute = `${ApiVersionOne}/auth`;
const adminRoute = `${ApiVersionOne}/admins`;

app.get("/", async (req, res) => {
  res.json({
    success: true,
    message: "welcome to boibikroy",
  });
});

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(cookieParser());
app.use(express.json());

app.use(authRoute, authRouter);
app.use(ApiVersionOne, feedbackRouter);
app.use(adminRoute, adminRouter);

// not found route
app.use((req, res) => {
  new ApiResponse(StatusCodes.NOT_FOUND, { error: "Not Found" }).send(res);
});

app.use(errorMiddleware);

export default app;
