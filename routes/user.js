const Router = require("express").Router;
const user = require("../controllers/user");
const { isAdmin, isCreator } = require("../middleware");

const router = new Router();

// POST /Signup
router.post("/signup", user.signup);

// POST /Login
router.post("/login", user.login);

// POST /RefreshToken
router.post("/refresh", user.refreshToken);

// GET /:userId - Restricted to user
router.get("/:userId", isCreator, user.getUserById);

// GET all - Restricted to admin
router.get("/", isAdmin, user.searchUsers);

// PUT single - Restricted to user
router.put("/:userId", isCreator);

// PUT change-role/:userid - Restricted to admin
router.put("/change-role/:userId", isAdmin, user.changeRole);

// DELETE /:userid - // Restricted to user
router.delete("/:userId", isCreator, user.deleteUser);

module.exports = router;
