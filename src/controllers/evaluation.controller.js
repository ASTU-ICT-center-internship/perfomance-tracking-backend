const { pool } = require("../config/db");

//---function to check if evaluation type is valid
async function isValidType(tid) {
  const [rows] = await pool.query("SELECT tid FROM type WHERE tid = ?", [tid]);
  return rows.length > 0;
}

// --Get all self evaluations for a user--
exports.getSelfEvaluationsByUser = async (req, res, next) => {
  const uid = req.params.uid;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM self_evaluation WHERE uid = ?",
      [uid]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//-- Creating a new self evaluation--
exports.createSelfEvaluation = async (req, res, next) => {
  const { uid, tid, criteria, weight, level, result, period } = req.body;

  if (!await isValidType(tid)) {
    return res.status(400).json({ message: "Invalid evaluation type ID" });
  }

  try {
    const [resultData] = await pool.query(
      `INSERT INTO self_evaluation 
      (uid, tid, criteria, weight, level, result, period)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uid, tid, criteria, weight, level, result, period]
    );

    res.status(201).json({ eid: resultData.insertId });
  } catch (error) {
    next(error);
  }
};

// Updating a self evaluation by eid
exports.updateSelfEvaluation = async (req, res, next) => {
  const eid = req.params.eid;
  const { criteria, weight, level, result, period } = req.body;

  try {
    const [resultData] = await pool.query(
      `UPDATE self_evaluation
      SET criteria = ?, weight = ?, level = ?, result = ?, period = ?
      WHERE eid = ?`,
      [criteria, weight, level, result, period, eid]
    );

    if (resultData.affectedRows === 0) {
      return res.status(404).json({ message: "Self evaluation not found" });
    }

    res.json({ message: "Self evaluation updated successfully" });
  } catch (error) {
    next(error);
  }
};

// Delete a self evaluation
exports.deleteSelfEvaluation = async (req, res, next) => {
  const eid = req.params.eid;

  try {
    const [resultData] = await pool.query(
      "DELETE FROM self_evaluation WHERE eid = ?",
      [eid]
    );

    if (resultData.affectedRows === 0) {
      return res.status(404).json({ message: "Self evaluation not found" });
    }

    res.json({ message: "Self evaluation deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// the same  CRUD for peer evaluations
exports.getPeerEvaluationsByUser = async (req, res, next) => {
  const uid = req.params.uid;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM peer_evaluation WHERE uid = ?",
      [uid]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.createPeerEvaluation = async (req, res, next) => {
  const { uid, evaluator_uid, tid, criteria, weight, level, result, period } = req.body;

  if (!await isValidType(tid)) {
    return res.status(400).json({ message: "Invalid evaluation type ID" });
  }

  try {
    const [resultData] = await pool.query(
      `INSERT INTO peer_evaluation 
      (uid, evaluator_uid, tid, criteria, weight, level, result, period)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uid, evaluator_uid, tid, criteria, weight, level, result, period]
    );

    res.status(201).json({ eid: resultData.insertId });
  } catch (error) {
    next(error);
  }
};

exports.updatePeerEvaluation = async (req, res, next) => {
  const eid = req.params.eid;
  const { criteria, weight, level, result, period } = req.body;

  try {
    const [resultData] = await pool.query(
      `UPDATE peer_evaluation
      SET criteria = ?, weight = ?, level = ?, result = ?, period = ?
      WHERE eid = ?`,
      [criteria, weight, level, result, period, eid]
    );

    if (resultData.affectedRows === 0) {
      return res.status(404).json({ message: "Peer evaluation not found" });
    }

    res.json({ message: "Peer evaluation updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deletePeerEvaluation = async (req, res, next) => {
  const eid = req.params.eid;

  try {
    const [resultData] = await pool.query(
      "DELETE FROM peer_evaluation WHERE eid = ?",
      [eid]
    );

    if (resultData.affectedRows === 0) {
      return res.status(404).json({ message: "Peer evaluation not found" });
    }

    res.json({ message: "Peer evaluation deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// CRUD for supervisor evaluations

exports.getSupervisorEvaluationsByUser = async (req, res, next) => {
  const uid = req.params.uid;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM supervisor_evaluation WHERE uid = ?",
      [uid]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.createSupervisorEvaluation = async (req, res, next) => {
  const { uid, supervisor_uid, tid, criteria, weight, level, result, period } = req.body;

  if (!await isValidType(tid)) {
    return res.status(400).json({ message: "Invalid evaluation type ID" });
  }

  try {
    const [resultData] = await pool.query(
      `INSERT INTO supervisor_evaluation 
      (uid, supervisor_uid, tid, criteria, weight, level, result, period)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uid, supervisor_uid, tid, criteria, weight, level, result, period]
    );

    res.status(201).json({ eid: resultData.insertId });
  } catch (error) {
    next(error);
  }
};

exports.updateSupervisorEvaluation = async (req, res, next) => {
  const eid = req.params.eid;
  const { criteria, weight, level, result, period } = req.body;

  try {
    const [resultData] = await pool.query(
      `UPDATE supervisor_evaluation
      SET criteria = ?, weight = ?, level = ?, result = ?, period = ?
      WHERE eid = ?`,
      [criteria, weight, level, result, period, eid]
    );

    if (resultData.affectedRows === 0) {
      return res.status(404).json({ message: "Supervisor evaluation not found" });
    }

    res.json({ message: "Supervisor evaluation updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteSupervisorEvaluation = async (req, res, next) => {
  const eid = req.params.eid;

  try {
    const [resultData] = await pool.query(
      "DELETE FROM supervisor_evaluation WHERE eid = ?",
      [eid]
    );

    if (resultData.affectedRows === 0) {
      return res.status(404).json({ message: "Supervisor evaluation not found" });
    }

    res.json({ message: "Supervisor evaluation deleted successfully" });
  } catch (error) {
    next(error);
  }
};
