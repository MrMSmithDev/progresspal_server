require("dotenv").config();

const express = require("express");
const cors = require("cors");

const UserRouter = require("./routes/user");
const WorkoutRouter = require("./routes/workout");

const app = express();

// Middleware

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes

app.use("/user", UserRouter);
app.use("/workout", WorkoutRouter);

// Error handling

app.get("/*", (req, res) => {
  res.status(404).json({ error: "Resource not found " });
});

module.exports = app;
