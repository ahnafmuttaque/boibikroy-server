import process from "node:process"
process.loadEnvFile()
import express from "express";
import {ApiResponse} from "./utils/ApiResponse.js";
import {StatusCodes} from "http-status-codes";
import feedbackRouter from "./modules/feedbacks/feedbacks.route.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const PORT = process.env.PORT ?? 8080;
const app = express();
const ApiVersionOne = "/api/v1";


app.get("/", async (req, res) => {
  res.json({
    success: true,
    message: "welcome to boibikroy"
  })
});

app.use(express.json());

app.use(ApiVersionOne, feedbackRouter);


// not found route
app.use((req, res) => {
  new ApiResponse(StatusCodes.NOT_FOUND, {error: "Not Found"}).send(res)
})

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`app started listening at ${PORT}`)
})
