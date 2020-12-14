import express from "express";
import bodyParser from "body-parser";

import * as CategoryRouter from "routes/categories";
import * as CheckpointRouter from "routes/checkpoints";
import * as CheckpointAssignmentRouter from "routes/checkpoint-assignments";
import * as GpsLocationRouter from "routes/locations";
import * as KrokRouter from "routes/kroks";
import * as ParticipantRouter from "routes/participants";
import * as RouteRouter from "routes/routes";
import * as StationRouter from "routes/stations";
import * as TagAssignmentRouter from "routes/tag-assignments";
import * as TeamRouter from "routes/teams";

const app = express();

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/categories", CategoryRouter.default);
app.use("/checkpoints", CheckpointRouter.default);
app.use("/checkpoint-assignments", CheckpointAssignmentRouter.default);
app.use("/locations", GpsLocationRouter.default);
app.use("/kroks", KrokRouter.default);
app.use("/participants", ParticipantRouter.default);
app.use("/routes", RouteRouter.default);
app.use("/stations", StationRouter.default);
app.use("/tag-assignments", TagAssignmentRouter.default);
app.use("/teams", TeamRouter.default);

// define a route handler for the default home page
app.get("/", (_, res) => {
  res.send("Hello world!");
});

export default app;
