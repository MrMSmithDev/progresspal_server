const Router = require("express").Router;
const weight = require("../controllers/weight");
const { isAdmin, isCreator, isAuth } = require("../middleware");

const router = new Router();

// GET single
router.get("/:weightId", weight.getWeightDataById);

// GET all - Restricted to admin
router.get("/", isAdmin, weight.getWeightData);

// POST - create weight data
router.post("/", isAuth, weight.createWeightData);

// PUT single - Edit weight data // Restricted to user
router.put("/:weightId", isCreator, weight.editWeightData); // TODO

// DELETE /:weightId - // Restricted to user
router.delete("/:weightId", isCreator, weight.deleteWeightData);

module.exports = router;
