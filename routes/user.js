const Router = require("express").Router;
const user = require("../controllers/user");

const router = new Router();

// POST /Signup
router.get("/signup", user.signup);

// POST /Login
router.get("/login", user.login);

// POST /RefreshToken
router.get("/refresh", user.refreshToken);

// GET /:userId
router.get(
  "/:userId",
  (req, res, next) => next(), // Add user check,
  user.getUserById,
);

// GET all - restricted to admin
router.get("/", user.SearchUsers);

// PUT single - restricted to user

// PUT change-role/:userid - restricted to admin

// DELETE /:userid - restricted to user/admin

module.exports = router;
