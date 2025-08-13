
const db = require("../config/db");
// Utility: Safe number conversion
const safeNumber = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

exports.getAllTypes = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM type");
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getTypeById = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM type WHERE id = ?", [req.params.tid]);
    if (!rows.length) return res.status(404).json({ message: "Type not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.createType = async (req, res, next) => {
  try {
    const { name, description, section_percentage } = req.body;

    // Validation: Check that section_percentage sum <= 100
    const totalPercentage = safeNumber(section_percentage);
    if (totalPercentage <= 0 || totalPercentage > 100) {
      return res.status(400).json({ message: "Section percentage must be between 1 and 100" });
    }

    const [result] = await db.query(
      "INSERT INTO type (name, description, section_percentage) VALUES (?, ?, ?)",
      [name, description, totalPercentage]
    );

    res.status(201).json({ id: result.insertId, name, description, section_percentage: totalPercentage });
  } catch (err) {
    next(err);
  }
};

exports.updateType = async (req, res, next) => {
  try {
    const { name, description, section_percentage } = req.body;
    const totalPercentage = safeNumber(section_percentage);

    if (totalPercentage <= 0 || totalPercentage > 100) {
      return res.status(400).json({ message: "Section percentage must be between 1 and 100" });
    }

    const [result] = await db.query(
      "UPDATE type SET name = ?, description = ?, section_percentage = ? WHERE id = ?",
      [name, description, totalPercentage, req.params.tid]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Type not found" });

    res.json({ id: req.params.tid, name, description, section_percentage: totalPercentage });
  } catch (err) {
    next(err);
  }
};

exports.deleteType = async (req, res, next) => {
  try {
    const [result] = await db.query("DELETE FROM type WHERE id = ?", [req.params.tid]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Type not found" });

    res.json({ message: "Type deleted successfully" });
  } catch (err) {
    next(err);
  }
};
