/**
 * @openapi
 *  tags:
 *    name: Tag Assignments
 *    description: API to manage tag assignments. Tag assignment specifies what
 *                 tag should be assigned to a person for a particular event
 */

/**
 * @openapi
 *  components:
 *    schemas:
 *      TagAssignment:
 *        type: object
 *        required:
 *          - tag
 *          - participant
 *          - event
 *        properties:
 *          tag:
 *            type: integer
 *            minimum: 0
 *            maximum: 65536
 *            exclusiveMaximum: true
 *            description: Tag unique number [0-65536)
 *          participant:
 *            type: string
 *            description: Participant unique identifier
 *          event:
 *            type: string
 *            description: Event unique identifier
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
 *          tag: 315
 *          participant: "5f8d0d55b54764421b715b62"
 *          event: "5f8d04b3b54764421b7156dc"
 *          createdAt: "2019-09-22T06:00:00.000Z"
 *          updatedAt: "2019-09-22T06:00:00.000Z"
 *    parameters:
 *      tagAssignmentId:
 *        in: path
 *        name: tagAssignmentId
 *        schema:
 *          type: string
 *        required: true
 *        description: Tag assignment unique identifier
 */

import express from "express";
import GenericController from "controller/Common";
import TagAssignmentController from "controller/TagAssignment";

// Router for /tag-assignments/ api
const router = express.Router();

router.param("id", GenericController.validateObjectId);
router.param("id", TagAssignmentController.validateAssignmentExists);

// Router for /tag-assignments/

/**
 * @openapi
 *  paths:
 *    /tag-assignments:
 *      get:
 *        summary: Get a list of tag assignments.
 *        tags: [Tag Assignments]
 *        parameters:
 *          - in: query
 *            name: event
 *            schema:
 *              type: string
 *            required: true
 *            description: Event unique identifier
 *          - in: query
 *            name: participant
 *            schema:
 *              type: string
 *            required: true
 *            description: Participant unique identifier
 *        responses:
 *          '200':
 *            description: A JSON array of assignments
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/TagAssignment'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.get("/", TagAssignmentController.getAll);

/**
 * @openapi
 *  paths:
 *    /tag-assignments/{tagAssignmentId}:
 *      get:
 *        summary: Get information about a single tag assignment.
 *        tags: [Tag Assignments]
 *        parameters:
 *          - $ref: '#/components/parameters/tagAssignmentId'
 *        responses:
 *          '200':
 *            description: Assignment data
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/TagAssignment'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.get("/:id", TagAssignmentController.getById);

/**
 * @openapi
 *  paths:
 *    /tag-assignments:
 *      post:
 *        summary: Create tag assignment.
 *        tags: [Tag Assignments]
 *        requestBody:
 *          description: Tag assignment data
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/TagAssignment'
 *              example:
 *                participant: "5f8d0d55b54764421b715b62"
 *                event: "5f8d04b3b54764421b7156dc"
 *        responses:
 *          '201':
 *            description: Assignment created
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/TagAssignment'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 */
router.post("/", TagAssignmentController.create);

/**
 * @openapi
 *  paths:
 *    /tag-assignments/{tagAssignmentId}:
 *      patch:
 *        summary: Update tag assignment.
 *        tags: [Tag Assignments]
 *        parameters:
 *          - $ref: '#/components/parameters/tagAssignmentId'
 *        requestBody:
 *          description: Assignment data
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/TagAssignment'
 *              example:
 *                event: "5f8d04b3b54764421b7156dc"
 *        responses:
 *          '200':
 *            description: Assignment updated
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/TagAssignment'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.patch("/:id", TagAssignmentController.update);

/**
 * @openapi
 *  paths:
 *    /tag-assignments/{tagAssignmentId}:
 *      delete:
 *        summary: Delete tag assignment.
 *        tags: [Tag Assignments]
 *        parameters:
 *          - $ref: '#/components/parameters/tagAssignmentId'
 *        responses:
 *          '204':
 *            description: Location has been deleted
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.delete("/:id", TagAssignmentController.deleteById);

export default router;
