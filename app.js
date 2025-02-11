require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const UserRouter = require("./routes/user");
const WeightRouter = require("./routes/weight");
const WorkoutRouter = require("./routes/workout");

const app = express();

const reqCheck = (req, res, next) => {
  // console.log(req);
  next();
};

// Middleware

app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(reqCheck);

// Routes

app.use("/user", UserRouter);
app.use("/weight", WeightRouter);
app.use("/workout", WorkoutRouter);

// Error handling

app.get("/*", (req, res) => {
  res.status(404).json({ error: "Resource not found " });
});

module.exports = app;
