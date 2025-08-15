// src/controllers/criteria.controller.js
const { pool } = require("../config/db");

// helper: validate remaining weight for a type (tid)
// when creating: pass cid = null
// when updating: pass the current cid to exclude it from the sum
async function canApplyWeight(tid, weight, cid = null) {
  // sum all weights for this tid, excluding current cid (if updating)
  let sql =
    "SELECT COALESCE(SUM(weight),0) AS sumWeight FROM criteria WHERE tid = ?";
  const params = [tid];
  if (cid !== null) {
    sql += " AND cid <> ?";
    params.push(cid);
  }
  const [rows] = await pool.query(sql, params);
  const currentSum = Number(rows[0]?.sumWeight || 0);
  const remaining = 100 - currentSum;
  return { ok: weight <= remaining, remaining };
}

// GET /api/criteria?tid=1&page=1&limit=10
const getAllCriteria = async (req, res) => {
  try {
    let { page = 1, limit = 10, tid } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];
    if (tid) {
      where.push("c.tid = ?");
      params.push(tid);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `
      SELECT c.cid, c.tid, c.criteria, c.weight, c.level,
             t.typeofevaluation, t.section_percentage
      FROM criteria c
      JOIN type t ON t.tid = c.tid
      ${whereSql}
      ORDER BY c.cid
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM criteria c
      ${whereSql.replace("c.tid", "tid")}
      `,
      params
    );
    const total = countRows[0]?.total || 0;

    res.json({
      data: rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getAllCriteria error:", err);
    res.status(500).json({ error: "Server error fetching criteria" });
  }
};

// GET /api/criteria/:cid
const getCriteriaById = async (req, res) => {
  try {
    const { cid } = req.params;
    const [rows] = await pool.query(
      `
      SELECT c.cid, c.tid, c.criteria, c.weight, c.level,
             t.typeofevaluation, t.section_percentage
      FROM criteria c
      JOIN type t ON t.tid = c.tid
      WHERE c.cid = ?
      `,
      [cid]
    );
    if (!rows.length)
      return res.status(404).json({ error: "Criteria not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("getCriteriaById error:", err);
    res.status(500).json({ error: "Server error fetching criteria" });
  }
};

// POST /api/criteria
// body: { tid, criteria, weight, level }
const createCriteria = async (req, res) => {
  try {
    let { tid, criteria, weight, level } = req.body;

    // basic validation
    if (!tid || !criteria || weight == null || level == null) {
      return res
        .status(400)
        .json({ error: "tid, criteria, weight, and level are required" });
    }
    tid = parseInt(tid, 10);
    weight = Number(weight);
    level = parseInt(level, 10);

    if (isNaN(tid))
      return res.status(400).json({ error: "tid must be a number" });
    if (!(weight >= 0 && weight <= 100))
      return res
        .status(400)
        .json({ error: "weight must be between 0 and 100" });
    if (!(level >= 1 && level <= 4))
      return res.status(400).json({ error: "level must be between 1 and 4" });

    // verify type exists
    const [typeRows] = await pool.query("SELECT tid FROM type WHERE tid = ?", [
      tid,
    ]);
    if (!typeRows.length)
      return res.status(400).json({ error: "Invalid tid: type not found" });

    // weight-sum guard
    const { ok, remaining } = await canApplyWeight(tid, weight, null);
    if (!ok) {
      return res.status(400).json({
        error: `Weight exceeds remaining allocation for this type. Remaining: ${remaining.toFixed(
          2
        )}`,
      });
    }

    const [result] = await pool.query(
      "INSERT INTO criteria (tid, criteria, weight, level) VALUES (?, ?, ?, ?)",
      [tid, criteria, weight, level]
    );

    res.status(201).json({
      message: "Criteria created successfully",
      criteria: { cid: result.insertId, tid, criteria, weight, level },
    });
  } catch (err) {
    console.error("createCriteria error:", err);
    res.status(500).json({ error: "Server error creating criteria" });
  }
};

// PUT /api/criteria/:cid
// body: { tid, criteria, weight, level }
const updateCriteria = async (req, res) => {
  try {
    const { cid } = req.params;
    let { tid, criteria, weight, level } = req.body;

    // check existing
    const [existingRows] = await pool.query(
      "SELECT * FROM criteria WHERE cid = ?",
      [cid]
    );
    if (!existingRows.length)
      return res.status(404).json({ error: "Criteria not found" });

    // default to existing values if not provided
    const current = existingRows[0];
    tid = tid != null ? parseInt(tid, 10) : current.tid;
    criteria = criteria != null ? criteria : current.criteria;
    weight = weight != null ? Number(weight) : Number(current.weight);
    level = level != null ? parseInt(level, 10) : current.level;

    if (isNaN(tid))
      return res.status(400).json({ error: "tid must be a number" });
    if (!(weight >= 0 && weight <= 100))
      return res
        .status(400)
        .json({ error: "weight must be between 0 and 100" });
    if (!(level >= 1 && level <= 4))
      return res.status(400).json({ error: "level must be between 1 and 4" });

    // verify type exists
    const [typeRows] = await pool.query("SELECT tid FROM type WHERE tid = ?", [
      tid,
    ]);
    if (!typeRows.length)
      return res.status(400).json({ error: "Invalid tid: type not found" });

    // weight-sum guard (exclude current cid from the sum)
    const { ok, remaining } = await canApplyWeight(
      tid,
      weight,
      parseInt(cid, 10)
    );
    if (!ok) {
      return res.status(400).json({
        error: `Weight exceeds remaining allocation for this type. Remaining (excluding this row): ${remaining.toFixed(
          2
        )}`,
      });
    }

    const [result] = await pool.query(
      "UPDATE criteria SET tid = ?, criteria = ?, weight = ?, level = ? WHERE cid = ?",
      [tid, criteria, weight, level, cid]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Criteria not found" });

    res.json({ message: "Criteria updated successfully" });
  } catch (err) {
    console.error("updateCriteria error:", err);
    res.status(500).json({ error: "Server error updating criteria" });
  }
};

// DELETE /api/criteria/:cid
const deleteCriteria = async (req, res) => {
  try {
    const { cid } = req.params;
    const [result] = await pool.query("DELETE FROM criteria WHERE cid = ?", [
      cid,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Criteria not found" });
    res.json({ message: "Criteria deleted successfully" });
  } catch (err) {
    console.error("deleteCriteria error:", err);
    res.status(500).json({ error: "Server error deleting criteria" });
  }
};

module.exports = {
  getAllCriteria,
  getCriteriaById,
  createCriteria,
  updateCriteria,
  deleteCriteria,
};
