import express from "express";
import GenericController from "controller/Common";
import RouteController from "controller/Route";
import TagAssignmentController from "controller/TagAssignment";

// Router for /routes/ api
const router = express.Router();

router.param("id", GenericController.validateObjectId);
router.param("id", RouteController.validateRouteExists);
router.param("tagAssignmentId", GenericController.validateObjectId);
router.param(
  "tagAssignmentId",
  TagAssignmentController.validateAssignmentExists
);

router.get("/", RouteController.getAll);
router.get("/:id", RouteController.getById);
router.post("/", RouteController.create);
router.patch("/:id", RouteController.update);
router.delete("/:id", RouteController.deleteById);
router.put("/:id/actions", RouteController.createActions);

export default router;
