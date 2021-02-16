import express from "express";
import GenericController from "controller/Common";
import TagAssignmentController from "controller/TagAssignment";

// Router for /tag-assignments/ api
const router = express.Router();

router.param("id", GenericController.validateObjectId);
router.param("id", TagAssignmentController.validateAssignmentExists);

// Router for /tag-assignments/
router.get("/", TagAssignmentController.getAll);
router.get("/:id", TagAssignmentController.getById);
router.post("/", TagAssignmentController.create);
router.patch("/:id", TagAssignmentController.update);
router.delete("/:id", TagAssignmentController.deleteById);

export default router;
