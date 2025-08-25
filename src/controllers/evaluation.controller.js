// controllers/evaluation.controller.js
const db = require("../config/db"); // MySQL pool
const createError = require("http-errors");

// Utility: Safe number conversion (avoid NaN)
const safeNum = (value, fallback = 0) => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

// Utility: Clamp score between 1–4
const validateLevel = (level) => {
  const lvl = safeNum(level, null);
  if (lvl < 1 || lvl > 4) {
    throw createError(400, `Invalid level score: ${level}. Must be between 1 and 4.`);
  }
  return lvl;
};

// Civil Service Calculation Formula
const calculateCivilServiceScore = (sections) => {
  try {
    // A: Technical (70%)
    const technicalWeights = [
      { weight: 25, score: sections.a1 },
      { weight: 25, score: sections.a2 },
      { weight: 10, score: sections.a3 },
      { weight: 10, score: sections.a4 },
      { weight: 20, score: sections.a5 },
      { weight: 10, score: sections.a6 },
    ];
    const technicalPoints = technicalWeights.reduce(
      (sum, { weight, score }) => sum + (weight * validateLevel(score)) / 4,
      0
    );
    const technicalTotal = (technicalPoints * 70) / 100;

    // B1: Behavioral – Own (5%)
    const ownWeights = [
      { weight: 25, score: sections.b1_1 },
      { weight: 20, score: sections.b1_2 },
      { weight: 15, score: sections.b1_3 },
      { weight: 15, score: sections.b1_4 },
      { weight: 15, score: sections.b1_5 },
      { weight: 10, score: sections.b1_6 },
    ];
    const ownPoints = ownWeights.reduce(
      (sum, { weight, score }) => sum + (weight * validateLevel(score)) / 4,
      0
    );
    const ownTotal = (ownPoints * 5) / 100;

    // B2: Behavioral – Immediate Supervisor (10%)
    const supWeights = [
      { weight: 25, score: sections.b2_1 },
      { weight: 20, score: sections.b2_2 },
      { weight: 15, score: sections.b2_3 },
      { weight: 15, score: sections.b2_4 },
      { weight: 15, score: sections.b2_5 },
      { weight: 10, score: sections.b2_6 },
    ];
    const supPoints = supWeights.reduce(
      (sum, { weight, score }) => sum + (weight * validateLevel(score)) / 4,
      0
    );
    const supTotal = (supPoints * 10) / 100;

    // B3: Team Evaluation (15%, scale 1–5)
    const teamScore = safeNum(sections.team, 0);
    if (teamScore < 1 || teamScore > 5) {
      throw createError(400, `Invalid team evaluation score: ${teamScore}. Must be between 1 and 5.`);
    }
    const teamTotal = (teamScore / 5) * 15;

    // Final results
    const overallResult = technicalTotal + ownTotal + supTotal + teamTotal;
    const averagePoint = technicalPoints + ownPoints + supPoints; // Without team score

    return {
      technicalTotal,
      ownTotal,
      supTotal,
      teamTotal,
      overallResult: Number(overallResult.toFixed(2)),
      averagePoint: Number(averagePoint.toFixed(2)),
    };
  } catch (err) {
    throw err; // Let global error handler process it
  }
};

// Controller functions
exports.createSelfEvaluation = async (req, res, next) => {
  try {
    const { user_id, sections } = req.body;
    const results = calculateCivilServiceScore(sections);

    await db.query(
      "INSERT INTO self_evaluation (user_id, sections_json, results_json) VALUES (?, ?, ?)",
      [user_id, JSON.stringify(sections), JSON.stringify(results)]
    );

    res.status(201).json({ message: "Self evaluation submitted", results });
  } catch (err) {
    next(err);
  }
};

exports.getSelfEvaluationsByUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM self_evaluation WHERE user_id = ?",
      [uid]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.updateSelfEvaluation = async (req, res, next) => {
  try {
    const { eid } = req.params;
    const { sections } = req.body;
    const results = calculateCivilServiceScore(sections);

    await db.query(
      "UPDATE self_evaluation SET sections_json = ?, results_json = ? WHERE id = ?",
      [JSON.stringify(sections), JSON.stringify(results), eid]
    );

    res.json({ message: "Self evaluation updated", results });
  } catch (err) {
    next(err);
  }
};

exports.deleteSelfEvaluation = async (req, res, next) => {
  try {
    const { eid } = req.params;
    await db.query("DELETE FROM self_evaluation WHERE id = ?", [eid]);
    res.json({ message: "Self evaluation deleted" });
  } catch (err) {
    next(err);
  }
};

// Similar functions for Peer and Supervisor Evaluations
exports.createPeerEvaluation = async (req, res, next) => {
  try {
    const { user_id, sections } = req.body;
    const results = calculateCivilServiceScore(sections);

    await db.query(
      "INSERT INTO peer_evaluation (user_id, sections_json, results_json) VALUES (?, ?, ?)",
      [user_id, JSON.stringify(sections), JSON.stringify(results)]
    );

    res.status(201).json({ message: "Peer evaluation submitted", results });
  } catch (err) {
    next(err);
  }
};

exports.getPeerEvaluationsByUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM peer_evaluation WHERE user_id = ?",
      [uid]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.updatePeerEvaluation = async (req, res, next) => {
  try {
    const { eid } = req.params;
    const { sections } = req.body;
    const results = calculateCivilServiceScore(sections);

    await db.query(
      "UPDATE peer_evaluation SET sections_json = ?, results_json = ? WHERE id = ?",
      [JSON.stringify(sections), JSON.stringify(results), eid]
    );

    res.json({ message: "Peer evaluation updated", results });
  } catch (err) {
    next(err);
  }
};

exports.deletePeerEvaluation = async (req, res, next) => {
  try {
    const { eid } = req.params;
    await db.query("DELETE FROM peer_evaluation WHERE id = ?", [eid]);
    res.json({ message: "Peer evaluation deleted" });
  } catch (err) {
    next(err);
  }
};

exports.createSupervisorEvaluation = async (req, res, next) => {
  try {
    const { user_id, sections } = req.body;
    const results = calculateCivilServiceScore(sections);

    await db.query(
      "INSERT INTO supervisor_evaluation (user_id, sections_json, results_json) VALUES (?, ?, ?)",
      [user_id, JSON.stringify(sections), JSON.stringify(results)]
    );

    res.status(201).json({ message: "Supervisor evaluation submitted", results });
  } catch (err) {
    next(err);
  }
};

exports.getSupervisorEvaluationsByUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM supervisor_evaluation WHERE user_id = ?",
      [uid]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.updateSupervisorEvaluation = async (req, res, next) => {
  try {
    const { eid } = req.params;
    const { sections } = req.body;
    const results = calculateCivilServiceScore(sections);

    await db.query(
      "UPDATE supervisor_evaluation SET sections_json = ?, results_json = ? WHERE id = ?",
      [JSON.stringify(sections), JSON.stringify(results), eid]
    );

    res.json({ message: "Supervisor evaluation updated", results });
  } catch (err) {
    next(err);
  }
};

exports.deleteSupervisorEvaluation = async (req, res, next) => {
  try {
    const { eid } = req.params;
    await db.query("DELETE FROM supervisor_evaluation WHERE id = ?", [eid]);
    res.json({ message: "Supervisor evaluation deleted" });
  } catch (err) {
    next(err);
  }
};
