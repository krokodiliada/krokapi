import express from "express";

import CategoryRouter from "routes/v1/categories";
import CheckpointRouter from "routes/v1/checkpoints";
import CheckpointAssignmentRouter from "routes/v1/checkpoint-assignments";
import DocsRouter from "routes/v1/docs";
import EventRouter from "routes/v1/events";
import GpsLocationRouter from "routes/v1/locations";
import ParticipantRouter from "routes/v1/participants";
import RouteRouter from "routes/v1/routes";
import StationRouter from "routes/v1/stations";
import TagAssignmentRouter from "routes/v1/tag-assignments";
import TeamRouter from "routes/v1/teams";

// Router for /v1/ api
const router = express.Router();

// Define API routes
router.use("/categories", CategoryRouter);
router.use("/checkpoints", CheckpointRouter);
router.use("/checkpoint-assignments", CheckpointAssignmentRouter);
router.use("/docs", DocsRouter);
router.use("/events", EventRouter);
router.use("/locations", GpsLocationRouter);
router.use("/participants", ParticipantRouter);
router.use("/routes", RouteRouter);
router.use("/stations", StationRouter);
router.use("/tag-assignments", TagAssignmentRouter);
router.use("/teams", TeamRouter);

export default router;
