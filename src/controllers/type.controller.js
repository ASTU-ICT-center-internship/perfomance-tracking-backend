const { pool } = require("../config/db");

// Get all evaluation types
exports.getAllTypes = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM type");
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// Get evaluation type by ID
exports.getTypeById = async (req, res, next) => {
  const tid = req.params.tid;
  try {
    const [rows] = await pool.query("SELECT * FROM type WHERE tid = ?", [tid]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Evaluation type not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// Create new evaluation type
exports.createType = async (req, res, next) => {
  const { typeofevaluation, section_percentage } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO type (typeofevaluation, section_percentage) VALUES (?, ?)",
      [typeofevaluation, section_percentage]
    );
    res.status(201).json({ tid: result.insertId, typeofevaluation, section_percentage });
  } catch (error) {
    next(error);
  }
};

// Update evaluation type
exports.updateType = async (req, res, next) => {
  const tid = req.params.tid;
  const { typeofevaluation, section_percentage } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE type SET typeofevaluation = ?, section_percentage = ? WHERE tid = ?",
      [typeofevaluation, section_percentage, tid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Evaluation type not found" });
    }
    res.json({ tid, typeofevaluation, section_percentage });
  } catch (error) {
    next(error);
  }
};

// Delete evaluation type
exports.deleteType = async (req, res, next) => {
  const tid = req.params.tid;
  try {
    const [result] = await pool.query("DELETE FROM type WHERE tid = ?", [tid]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Evaluation type not found" });
    }
    res.json({ message: "Evaluation type deleted successfully" });
  } catch (error) {
    next(error);
  }
};
