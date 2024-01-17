const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const DBConnection = require("./database/connection");
const HttpError = require("./utils/HttpError");

const taskRoutes = require("./routes/tasks");
const userRoutes = require("./routes/users");

dotenv.config({
  path: "./env",
});

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.use(() => {
  throw new HttpError(404, "Something went wrong");
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.statusCode || 500);
  res.json({ message: error.message || "Something went wrong" });
});

DBConnection()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is listening at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB Connection Failed", err);
  });
