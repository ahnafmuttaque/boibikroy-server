import process from "node:process"
process.loadEnvFile()
import express from "express";

const PORT = process.env.PORT ?? 8080;
const app = express();


app.get("/", async (req, res) => {
  res.json({
    success: true,
    message: "welcome to boibikroy"
  })
})

app.listen(PORT, () => {
  console.log(`app started listening at ${PORT}`)
})
