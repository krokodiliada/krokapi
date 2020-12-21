import express from "express";
import GenericController from "controller/Common";
import TeamController from "controller/Team";

// Router for /teams/ api
const router = express.Router();

router.param("id", GenericController.validateObjectId);
router.param("id", TeamController.validateTeamExists);

// Disallow the following methods
router.post("/:id", GenericController.disallowMethod);

// Router for /teams/
router.get("/", TeamController.getAll);
router.get("/:id", TeamController.getById);
router.post("/", TeamController.create);
router.patch("/:id", TeamController.update);
router.delete("/:id", TeamController.deleteById);

export default router;
