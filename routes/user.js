const Router = require("express").Router;
const user = require("../controllers/user");
const { isAdmin, isCreator, isAuth } = require("../middleware");

const router = new Router();

// GET /:userId - Restricted to user
router.get("/:userId", isCreator, user.getUserById);

// GET all - Restricted to admin
router.get("/", isAdmin, user.searchUsers);

// POST /Signup
router.post("/signup", user.signup);

// POST /Login
router.post("/login", user.login);

// POST /RefreshToken
router.post("/refresh", user.refreshToken);

// PUT single - Restricted to user
router.put("/:userId", isCreator); // TODO

// PUT /updatePassword
router.put("/update-password", isAuth, user.updatePassword);

// PUT change-role/:userid - Restricted to admin
router.put("/change-role/:userId", isAdmin, user.changeRole);

// DELETE /:userid - // Restricted to user
router.delete("/:userId", isCreator, user.deleteUser);

module.exports = router;
