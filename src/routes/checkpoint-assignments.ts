import express from "express";
import GenericController from "controller/Common";
import CheckpointAssignmentController from "controller/CheckpointAssignment";

// Router for /checkpoint-assignments/ api
const router = express.Router();

router.param("id", GenericController.validateObjectId);
router.param("id", CheckpointAssignmentController.validateAssignmentExists);

// Router for /checkpoint-assignments/
router.get("/", CheckpointAssignmentController.getAll);
router.get("/:id", CheckpointAssignmentController.getById);
router.post("/", CheckpointAssignmentController.create);
router.patch("/:id", CheckpointAssignmentController.update);
router.delete("/:id", CheckpointAssignmentController.deleteById);

export default router;
