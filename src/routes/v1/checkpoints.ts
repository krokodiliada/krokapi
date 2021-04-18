/**
 * @openapi
 *  tags:
 *    name: Checkpoints
 *    description: API to manage checkpoint assignments. A checkpoint is
 *                 a unique link between location, event, category, and
 *                 a station. Checkpoints in a category can be set in a specific
 *                 order or w/o any order. They can be mandatory or optional and
 *                 also can have a cost associated with it, e.g. in case of the
 *                 rogaining.
 */

/**
 * @openapi
 *  components:
 *    schemas:
 *      Checkpoint:
 *        type: object
 *        required:
 *          - event
 *          - category
 *          - location
 *        properties:
 *          event:
 *            type: string
 *            description: Unique identifier of the event
 *          category:
 *            type: string
 *            description: Unique identifier of the category
 *          location:
 *            type: string
 *            description: Unique identifier of the checkpoint
 *          station:
 *            type: string
 *            description: Unique identifier of the station
 *          required:
 *            type: boolean
 *            default: true
 *            description: True if checkpoint is required to be taken
 *          checkOrder:
 *            type: boolean
 *            default: true
 *            description: True if the order in which this checkpoint is taken
 *                         will matter
 *          order:
 *            type: integer
 *            description: Order number in which this checkpoint must be taken.
 *                         This parameter takes effect when checkOrder is set
 *                         to true.
 *          cost:
 *            type: number
 *            description: Describes how much it will cost to take
 *                         (or not to take) this checkpoint.
 *          costMetric:
 *            type: string
 *            default: seconds
 *            enum: [points, seconds, minutes, hours]
 *            description: Metric that the checkpoint's cost will be considered
 *                         with
 *          createdAt:
 *            type: string
 *            format: date
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date
 *            description: The date when the record was last updated.
 *        example:
 *          _id: "5f907c38b54764421b71609e"
 *          event: "5f8d04b3b54764421b7156dc"
 *          category: "5f8d04f7b54764421b7156e1"
 *          location: "5f8f8720b54764421b715f21"
 *          station: "5f8f8c44b54764421b715f51"
 *          required: true
 *          checkOrder: true
 *          order: 4
 *          createdAt: "2019-09-22T06:00:00.000Z"
 *          updatedAt: "2019-09-22T06:00:00.000Z"
 *    parameters:
 *      checkpointId:
 *        in: path
 *        name: checkpointId
 *        schema:
 *          type: string
 *        required: true
 *        description: Unique identifier of the checkpoint
 */

import express from "express";
import GenericController from "controller/Common";
import CheckpointController from "controller/Checkpoint";

// Router for /checkpoints/ api
const router = express.Router();

router.param("id", GenericController.validateObjectId);
router.param("id", CheckpointController.validateAssignmentExists);

// Router for /checkpoints/

/**
 * @openapi
 *  paths:
 *    /checkpoints:
 *      get:
 *        summary: Get a list of checkpoints.
 *        tags: [Checkpoints]
 *        responses:
 *          '200':
 *            description: A JSON array of all checkpoints
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Checkpoint'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 */
router.get("/", CheckpointController.getAll);

/**
 * @openapi
 *  paths:
 *    /checkpoints/{checkpointId}:
 *      get:
 *        summary: Get information about a single checkpoint.
 *        tags: [Checkpoints]
 *        parameters:
 *          - $ref: '#/components/parameters/checkpointId'
 *        responses:
 *          '200':
 *            description: Checkpoint data
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Checkpoint'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.get("/:id", CheckpointController.getById);

/**
 * @openapi
 *  paths:
 *    /checkpoints:
 *      post:
 *        summary: Create a checkpoint.
 *        tags: [Checkpoints]
 *        requestBody:
 *          description: Assignment data
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Checkpoint'
 *              example:
 *                event: "5f8d04b3b54764421b7156dc"
 *                category: "5f8d04f7b54764421b7156e1"
 *                location: "5f8f8720b54764421b715f21"
 *        responses:
 *          '201':
 *            description: Assignment created
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Checkpoint'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 */
router.post("/", CheckpointController.create);

/**
 * @openapi
 *  paths:
 *    /checkpoints/{checkpointId}:
 *      patch:
 *        summary: Update checkpoint.
 *        tags: [Checkpoints]
 *        parameters:
 *          - $ref: '#/components/parameters/checkpointId'
 *        requestBody:
 *          description: Assignment data to update
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Checkpoint'
 *              example:
 *                checkOrder: true
 *                order: 4
 *        responses:
 *          '200':
 *            description: Assignment updated
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Checkpoint'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.patch("/:id", CheckpointController.update);

/**
 * @openapi
 *  paths:
 *    /checkpoints/{checkpointId}:
 *      delete:
 *        summary: Delete checkpoint.
 *        tags: [Checkpoints]
 *        parameters:
 *          - $ref: '#/components/parameters/checkpointId'
 *        responses:
 *          '204':
 *            description: Assignment has been deleted
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.delete("/:id", CheckpointController.deleteById);

export default router;
