// controllers/division.controller.js
const { pool } = require("../config/db");

// GET /api/divisions?page=1&limit=10
const getAllDivisions = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      "SELECT * FROM division ORDER BY id LIMIT ? OFFSET ?",
      [limit, offset]
    );
    const [countRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM division"
    );
    const total = countRows[0] ? countRows[0].total : 0;

    res.json({
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getAllDivisions error:", err);
    res.status(500).json({ error: "Server error fetching divisions" });
  }
};

// POST /api/divisions
const createDivision = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: "Division name is required" });

    // check uniqueness
    const [existing] = await pool.query(
      "SELECT id FROM division WHERE name = ?",
      [name.trim()]
    );
    if (existing.length > 0)
      return res.status(400).json({ error: "Division already exists" });

    const [result] = await pool.query(
      "INSERT INTO division (name) VALUES (?)",
      [name.trim()]
    );
    res.status(201).json({
      message: "Division added successfully",
      division: { id: result.insertId, name: name.trim() },
    });
  } catch (err) {
    console.error("createDivision error:", err);
    res.status(500).json({ error: "Server error creating division" });
  }
};

// PUT /api/divisions/:id
const updateDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: "Division name is required" });

    const [result] = await pool.query(
      "UPDATE division SET name = ? WHERE id = ?",
      [name.trim(), id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Division not found" });

    res.json({ message: "Division updated successfully" });
  } catch (err) {
    console.error("updateDivision error:", err);
    res.status(500).json({ error: "Server error updating division" });
  }
};

// DELETE /api/divisions/:id
const deleteDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM division WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Division not found" });

    res.json({ message: "Division deleted successfully" });
  } catch (err) {
    console.error("deleteDivision error:", err);
    res.status(500).json({ error: "Server error deleting division" });
  }
};

// GET /api/divisions/name/:name
const getDivisionIdByName = async (req, res) => {
  try {
    const { name } = req.params;
    const [rows] = await pool.query("SELECT id FROM division WHERE name = ?", [
      name,
    ]);

    if (!rows || rows.length === 0)
      return res.status(404).json({ error: "Division not found" });
    res.json({ id: rows[0].id });
  } catch (err) {
    console.error("getDivisionIdByName error:", err);
    res.status(500).json({ error: "Server error fetching division ID" });
  }
};

module.exports = {
  getAllDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
  getDivisionIdByName,
};
