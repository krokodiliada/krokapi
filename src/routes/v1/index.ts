/**
 * Generic API schemas, such as errors
 * @openapi
 *  components:
 *    responses:
 *      BadRequest:
 *        description: Bad request. Invalid request data.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *            example:
 *              error: "Bad request. Check your request data."
 *      NotFound:
 *        description: The specified resource was not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *            example:
 *              error: "Resource not found."
 *      Unauthorized:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *            example:
 *              error: "Not authorized."
 *    schemas:
 *      Error:
 *        type: object
 *        properties:
 *          error:
 *            type: string
 *        required:
 *          - error
 */

import express from "express";

import CategoryRouter from "routes/v1/categories";
import CheckpointRouter from "routes/v1/checkpoints";
import DocsRouter from "routes/v1/docs";
import EventRouter from "routes/v1/events";
import LocationRouter from "routes/v1/locations";
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
router.use("/docs", DocsRouter);
router.use("/events", EventRouter);
router.use("/locations", LocationRouter);
router.use("/participants", ParticipantRouter);
router.use("/routes", RouteRouter);
router.use("/stations", StationRouter);
router.use("/tag-assignments", TagAssignmentRouter);
router.use("/teams", TeamRouter);

export default router;
