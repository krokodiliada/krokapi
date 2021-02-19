/**
 * @openapi
 *  components:
 *    schemas:
 *      Event:
 *        type: object
 *        required:
 *          - number
 *          - date
 *        properties:
 *          number:
 *            type: integer
 *            description: The consequent number of the event
 *          categories:
 *            type: array
 *            description: The list of categogy IDs assigned to this event
 *            items:
 *              type: string
 *          season:
 *            type: string
 *            description: Either spring or fall
 *            enum: [fall, spring]
 *          date:
 *            type: object
 *            description: The date when the event starts and ends
 *            properties:
 *              start:
 *                type: string
 *                format: date
 *                description: Start date of the event
 *              end:
 *                type: string
 *                format: date
 *                description: End date of the event
 *          location:
 *            type: string
 *            description: ID of the location object
 *          createdAt:
 *            type: string
 *            format: date
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date
 *            description: The date when the record was last updated.
 *        example:
 *           number: 50
 *           categories: [
 *             "5f7d04f7a54364421c7136e1",
 *             "5f7d04f7a54364421c7136e2",
 *             "5f7d04f7a54364421c7136e3",
 *           ]
 *           season: "fall"
 *           date: {
 *             start: "2019-09-22T04:00:00.000Z",
 *             end: "2019-09-24T04:00:00.000Z"
 *           }
 *           location: "5f7d04f7a54364431c7136c5"
 *           createdAt: "2019-09-22T06:00:00.000Z"
 *           updatedAt: "2019-09-22T06:00:00.000Z"
 */

/**
 * @openapi
 *   tags:
 *     name: Events
 *     description: API to manage events.
 */

/**
 * @openapi
 *  components:
 *    parameters:
 *      eventNumber:
 *        in: path
 *        name: number
 *        schema:
 *          type: integer
 *        required: true
 *        description: Number of the event to get
 */

import express from "express";
import EventController from "controller/Event";
import GenericController from "controller/Common";

// Event Router
const router = express.Router();
const categoriesRouter = express.Router({ mergeParams: true });
const locationRouter = express.Router({ mergeParams: true });

router.param("number", GenericController.validateNumber);
router.param("number", EventController.validateEventExists);

// Disallow the following methods
router.post("/", GenericController.disallowMethod);
router.post("/:number", GenericController.disallowMethod);
router.put("/", GenericController.disallowMethod);
router.delete("/", GenericController.disallowMethod);

// Router for /events/

/**
 * @openapi
 *  paths:
 *    /events:
 *      get:
 *        summary: Get a list of events.
 *        tags: [Events]
 *        responses:
 *          '200':
 *            description: A JSON array of events
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Event'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 */
router.get("/", EventController.getAll);

/**
 * @openapi
 *  paths:
 *    /events/{number}:
 *      get:
 *        summary: Get information about a single event.
 *        tags: [Events]
 *        parameters:
 *          - $ref: '#/components/parameters/eventNumber'
 *        responses:
 *          '200':
 *            description: An event data
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Event'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.get("/:number", EventController.getByNumber);

/**
 * @openapi
 *  paths:
 *    /events/{number}:
 *      put:
 *        summary: Create event.
 *        tags: [Events]
 *        parameters:
 *          - $ref: '#/components/parameters/eventNumber'
 *        requestBody:
 *          description: Event data
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Event'
 *              example:
 *                date:
 *                  start: "Sep 25, 2021"
 *                  end: "Sep 27, 2021"
 *        responses:
 *          '201':
 *            description: Event created
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Event'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 */
router.put("/:number", EventController.create);

/**
 * @openapi
 *  paths:
 *    /events/{number}:
 *      patch:
 *        summary: Update event.
 *        tags: [Events]
 *        parameters:
 *          - $ref: '#/components/parameters/eventNumber'
 *        requestBody:
 *          description: Event data
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Event'
 *              example:
 *                categories: [
 *                  "5f7d04f7a54364421c7136e1",
 *                  "5f7d04f7a54364421c7136e2",
 *                ]
 *        responses:
 *          '200':
 *            description: Event updated
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Event'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.patch("/:number", EventController.update);

/**
 * @openapi
 *  paths:
 *    /events/{number}:
 *      delete:
 *        summary: Update event.
 *        tags: [Events]
 *        parameters:
 *          - $ref: '#/components/parameters/eventNumber'
 *        responses:
 *          '204':
 *            description: Event has been deleted
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.delete("/:number", EventController.deleteByNumber);

// Router for /events/:number/categories
router.use("/:number/categories", categoriesRouter);
categoriesRouter.param("categoryId", EventController.validateCategory);

categoriesRouter.get("/", EventController.getAllCategories);
categoriesRouter.delete("/:categoryId", EventController.deleteCategory);
categoriesRouter.put("/:categoryId", EventController.addCategory);

// Router for /events/:number/location
router.use("/:number/location", locationRouter);
locationRouter.param("locationId", EventController.validateLocation);

locationRouter.get("/", EventController.getLocation);
locationRouter.delete("/", EventController.deleteLocation);
locationRouter.put("/:locationId", EventController.addLocation);

export default router;
