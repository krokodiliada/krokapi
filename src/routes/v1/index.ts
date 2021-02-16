import express from "express";

import * as CategoryRouter from "routes/v1/categories";
import * as CheckpointRouter from "routes/v1/checkpoints";
import * as CheckpointAssignmentRouter from "routes/v1/checkpoint-assignments";
import * as GpsLocationRouter from "routes/v1/locations";
import * as EventRouter from "routes/v1/events";
import * as ParticipantRouter from "routes/v1/participants";
import * as RouteRouter from "routes/v1/routes";
import * as StationRouter from "routes/v1/stations";
import * as TagAssignmentRouter from "routes/v1/tag-assignments";
import * as TeamRouter from "routes/v1/teams";

// Router for /v1/ api
const router = express.Router();

router.use("/categories", CategoryRouter.default);
router.use("/checkpoints", CheckpointRouter.default);
router.use("/checkpoint-assignments", CheckpointAssignmentRouter.default);
router.use("/locations", GpsLocationRouter.default);
router.use("/events", EventRouter.default);
router.use("/participants", ParticipantRouter.default);
router.use("/routes", RouteRouter.default);
router.use("/stations", StationRouter.default);
router.use("/tag-assignments", TagAssignmentRouter.default);
router.use("/teams", TeamRouter.default);

export default router;
