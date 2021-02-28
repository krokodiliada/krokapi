/**
 * @openapi
 *  tags:
 *    name: Checkpoints
 *    description: API to manage checkpoints.
 */

/**
 * @openapi
 *  components:
 *    schemas:
 *      Checkpoint:
 *        type: object
 *        required:
 *          - name
 *        properties:
 *          name:
 *            type: string
 *            description: The short name of the checkpoint
 *          location:
 *            type: string
 *            description: Unique id of the location
 *          description:
 *            type: string
 *            description: Full description of the checkpoint
 *          water:
 *            type: boolean
 *            description: True if checkpoint is used for the water stage of the
 *                         competition. For such checkpoints there is no
 *                         GPS location required to be set and checkpoints are
 *                         rather considered placeholders.
 *          note:
 *            type: string
 *            description: A short note for the checkpoint
 *          createdAt:
 *            type: string
 *            format: date
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date
 *            description: The date when the record was last updated.
 *        example:
 *          _id: "5f8f83f6b54764421b715eea"
 *          name: "Next to the road"
 *          location: "5f8f83f6b54764421b715ef4"
 *          description: "Beautiful tree 30 degrees to the right of the road"
 *          water: false
 *          note: "There are two trees, we pick the closest one"
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
router.param("id", CheckpointController.validateCheckpointExists);

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
 *        summary: Create checkpoint.
 *        tags: [Checkpoints]
 *        requestBody:
 *          description: Checkpoint data
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Checkpoint'
 *              example:
 *                name: "New Checkpoint"
 *                location: "5f8f83f6b54764421b715ef4"
 *        responses:
 *          '201':
 *            description: Checkpoint created
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
 *          description: Checkpoint data to update
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Checkpoint'
 *              example:
 *                location: "5f8f83f6b54764421b715ef4"
 *        responses:
 *          '200':
 *            description: Checkpoint updated
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
 *            description: Checkpoint has been deleted
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.delete("/:id", CheckpointController.deleteById);

export default router;
