import express from "express";
import routerQuestion from "./routes/questions.mjs";
import routerAnswer from "./routes/answers.mjs";

const app = express();
const port = 4000;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.use("/questions", routerQuestion);
app.use("/answers", routerAnswer);

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});