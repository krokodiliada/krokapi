import express from "express";
import ParticipantController from "controller/Participant";
import GenericController from "controller/Common";

// Router for /events/ api
const router = express.Router();

router.param("id", GenericController.validateObjectId);
router.param("id", ParticipantController.validateParticipantExists);

router.post("/:id", GenericController.disallowMethod);
router.put("/", GenericController.disallowMethod);
router.put("/:id", GenericController.disallowMethod);
router.delete("/", GenericController.disallowMethod);

router.get("/", ParticipantController.getAll);
router.get("/:id", ParticipantController.getById);
router.post("/", ParticipantController.create);
router.patch("/:id", ParticipantController.update);
router.delete("/:id", ParticipantController.deleteById);

export default router;
