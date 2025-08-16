// routes/division.routes.js
const express = require("express");
const router = express.Router();
const divisionController = require("../controllers/division.controller");

const auth = require("../middlewares/auth.middlware");

// small admin checker (depends on auth middleware attaching req.user.role)
const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden: admin only" });
  next();
};

router.get("/", auth, divisionController.getAllDivisions);
router.get("/name/:name", auth, divisionController.getDivisionIdByName);

// protect create/update/delete so only admin can use them
router.post("/", auth, isAdmin, divisionController.createDivision);
router.put("/:id", auth, isAdmin, divisionController.updateDivision);
router.delete("/:id", auth, isAdmin, divisionController.deleteDivision);

module.exports = router;
