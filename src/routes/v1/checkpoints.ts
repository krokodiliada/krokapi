import express from "express";
import GenericController from "controller/Common";
import CheckpointController from "controller/Checkpoint";

// Router for /checkpoints/ api
const router = express.Router();

router.param("id", GenericController.validateObjectId);
router.param("id", CheckpointController.validateCheckpointExists);

// Router for /checkpoints/
router.get("/", CheckpointController.getAll);
router.get("/:id", CheckpointController.getById);
router.post("/", CheckpointController.create);
router.patch("/:id", CheckpointController.update);
router.delete("/:id", CheckpointController.deleteById);

export default router;
