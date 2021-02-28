/**
 * @openapi
 *  tags:
 *    name: Participants
 *    description: API to manage participants.
 */

/**
 * @openapi
 *  components:
 *    schemas:
 *      Participant:
 *        type: object
 *        required:
 *          - name
 *          - birthday
 *        properties:
 *          name:
 *            required:
 *              - first
 *              - last
 *            properties:
 *              first:
 *                type: string
 *                description: First name
 *              last:
 *                type: string
 *                description: Last name
 *              middle:
 *                type: string
 *                description: Middle name, if any
 *          birthday:
 *            type: string
 *            format: date
 *            description: Day, month, and year when the person was born
 *          phone:
 *            type: string
 *            description: Phone number
 *          email:
 *            type: string
 *            description: Email address
 *          createdAt:
 *            type: string
 *            format: date
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date
 *            description: The date when the record was last updated.
 *        example:
 *          _id: "5f8d0d55b54764421b715b62"
 *          name: {
 *            first: "Jaime",
 *            last: "Rojas",
 *          }
 *          birthday: "1953-01-05T06:00:00.000Z"
 *          phone: "+79636602193"
 *          email: "jaime83@yahoo.com"
 *          createdAt: "2019-09-22T06:00:00.000Z"
 *          updatedAt: "2019-09-22T06:00:00.000Z"
 *    parameters:
 *      participantId:
 *        in: path
 *        name: participantId
 *        schema:
 *          type: string
 *        required: true
 *        description: Unique identifier of the participant
 */

import express from "express";
import ParticipantController from "controller/Participant";
import GenericController from "controller/Common";

// Router for /events/ api
const router = express.Router();

router.param("id", GenericController.validateObjectId);
router.param("id", ParticipantController.validateParticipantExists);

router.post("/:id", GenericController.disallowMethod);
router.put("/", GenericController.disallowMethod);
router.put("/:id", GenericController.disallowMethod);
router.delete("/", GenericController.disallowMethod);

/**
 * @openapi
 *  paths:
 *    /participants:
 *      get:
 *        summary: Get a list of participants.
 *        tags: [Participants]
 *        responses:
 *          '200':
 *            description: A JSON array of all participants
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Participant'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 */
router.get("/", ParticipantController.getAll);

/**
 * @openapi
 *  paths:
 *    /participants/{participantId}:
 *      get:
 *        summary: Get information about a single participant.
 *        tags: [Participants]
 *        parameters:
 *          - $ref: '#/components/parameters/participantId'
 *        responses:
 *          '200':
 *            description: Participant data
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Participant'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.get("/:id", ParticipantController.getById);

/**
 * @openapi
 *  paths:
 *    /participants:
 *      post:
 *        summary: Create participant.
 *        tags: [Participants]
 *        requestBody:
 *          description: Participant data
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Participant'
 *              example:
 *                name: {
 *                  first: "Jaime",
 *                  last: "Rojas",
 *                }
 *                birthday: "1953-01-05T06:00:00.000Z"
 *        responses:
 *          '201':
 *            description: Participant created
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Participant'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 */
router.post("/", ParticipantController.create);

/**
 * @openapi
 *  paths:
 *    /participants/{participantId}:
 *      patch:
 *        summary: Update participant.
 *        tags: [Participants]
 *        parameters:
 *          - $ref: '#/components/parameters/participantId'
 *        requestBody:
 *          description: Participant data to update
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Participant'
 *              example:
 *                email: "jaime83@yahoo.com"
 *        responses:
 *          '200':
 *            description: Participant updated
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Participant'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.patch("/:id", ParticipantController.update);

/**
 * @openapi
 *  paths:
 *    /participants/{participantId}:
 *      delete:
 *        summary: Delete participant.
 *        tags: [Participants]
 *        parameters:
 *          - $ref: '#/components/parameters/participantId'
 *        responses:
 *          '204':
 *            description: Participant has been deleted
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.delete("/:id", ParticipantController.deleteById);

export default router;
