// src/routes/criteria.routes.js
const express = require("express");
const router = express.Router();
const criteriaController = require("../controllers/criteria.controller");
const auth = require("../middlewares/auth.middlware");

const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden: admin only" });
  next();
};

// list all or by type (tid)
router.get("/", auth, criteriaController.getAllCriteria);

// one by id
router.get("/:cid", auth, criteriaController.getCriteriaById);

// admin can manage
router.post("/", auth, isAdmin, criteriaController.createCriteria);
router.put("/:cid", auth, isAdmin, criteriaController.updateCriteria);
router.delete("/:cid", auth, isAdmin, criteriaController.deleteCriteria);

module.exports = router;
