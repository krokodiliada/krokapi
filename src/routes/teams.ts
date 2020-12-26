import express from "express";
import GenericController from "controller/Common";
import TeamController from "controller/Team";

// Router for /teams/ api
const router = express.Router();
const participantsRouter = express.Router({ mergeParams: true });
const teamRouteRouter = express.Router({ mergeParams: true });
const waterRouteRouter = express.Router({ mergeParams: true });

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

// Router for /teams/:id/participants
router.use("/:id/participants", participantsRouter);
participantsRouter.get("/", TeamController.getParticipants);

// Router for /teams/:id/route
router.use("/:id/route", teamRouteRouter);
teamRouteRouter.get("/", TeamController.getRoute);

// Router for /teams/:id/route-water
router.use("/:id/route-water", waterRouteRouter);
waterRouteRouter.get("/", TeamController.getWaterRoute);

export default router;
