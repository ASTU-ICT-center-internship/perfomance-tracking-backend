const express = require("express");
const router = express.Router();

const evaluationController = require("../controllers/evaluation.controller");

// Self Evaluations
router.get("/self/:uid", evaluationController.getSelfEvaluationsByUser);
router.post("/self", evaluationController.createSelfEvaluation);
router.put("/self/:eid", evaluationController.updateSelfEvaluation);
router.delete("/self/:eid", evaluationController.deleteSelfEvaluation);

// Peer Evaluations
router.get("/peer/:uid", evaluationController.getPeerEvaluationsByUser);
router.post("/peer", evaluationController.createPeerEvaluation);
router.put("/peer/:eid", evaluationController.updatePeerEvaluation);
router.delete("/peer/:eid", evaluationController.deletePeerEvaluation);

// Supervisor Evaluations
router.get("/supervisor/:uid", evaluationController.getSupervisorEvaluationsByUser);
router.post("/supervisor", evaluationController.createSupervisorEvaluation);
router.put("/supervisor/:eid", evaluationController.updateSupervisorEvaluation);
router.delete("/supervisor/:eid", evaluationController.deleteSupervisorEvaluation);

module.exports = router;
