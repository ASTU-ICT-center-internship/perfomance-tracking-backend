const express = require("express");
const router = express.Router();

const typeController = require("../controllers/type.controller");

router.get("/", typeController.getAllTypes);
router.get("/:tid", typeController.getTypeById);
router.post("/", typeController.createType);
router.put("/:tid", typeController.updateType);
router.delete("/:tid", typeController.deleteType);

module.exports = router;
