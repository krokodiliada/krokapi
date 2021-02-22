/**
 * @openapi
 *  tags:
 *    name: Events
 *    description: API to manage events.
 */

/**
 * @openapi
 *  components:
 *    schemas:
 *      Event:
 *        type: object
 *        required:
 *          - name
 *          - date
 *        properties:
 *          name:
 *            type: string
 *            description: The name of the event
 *          categories:
 *            type: array
 *            description: The list of categogy IDs assigned to this event
 *            items:
 *              type: string
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
 *          _id: "5f8f83f6b54764421b715eea"
 *          name: "New Event"
 *          categories: [
 *            "5f7d04f7a54364421c7136e1",
 *            "5f7d04f7a54364421c7136e2",
 *            "5f7d04f7a54364421c7136e3",
 *          ]
 *          date: {
 *            start: "2019-09-22T04:00:00.000Z",
 *            end: "2019-09-24T04:00:00.000Z"
 *          }
 *          location: "5f7d04f7a54364431c7136c5"
 *          createdAt: "2019-09-22T06:00:00.000Z"
 *          updatedAt: "2019-09-22T06:00:00.000Z"
 *    parameters:
 *      eventId:
 *        in: path
 *        name: eventId
 *        schema:
 *          type: string
 *        required: true
 *        description: Unique identifier of the event
 *      categoryId:
 *          in: path
 *          name: categoryId
 *          schema:
 *            type: string
 *          required: true
 *          description: Unique identifier of the category
 *      locationId:
 *          in: path
 *          name: locationId
 *          schema:
 *            type: string
 *          required: true
 *          description: Unique identifier of the location
 */

import express from "express";
import EventController from "controller/Event";
import GenericController from "controller/Common";

// Event Router
const router = express.Router();
const categoriesRouter = express.Router({ mergeParams: true });
const locationRouter = express.Router({ mergeParams: true });

router.param("id", GenericController.validateObjectId);
router.param("id", EventController.validateEventExists);

// Disallow the following methods
router.post("/:id", GenericController.disallowMethod);
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
 *    /events/{eventId}:
 *      get:
 *        summary: Get information about a single event.
 *        tags: [Events]
 *        parameters:
 *          - $ref: '#/components/parameters/eventId'
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
router.get("/:id", EventController.getById);

/**
 * @openapi
 *  paths:
 *    /events/:
 *      post:
 *        summary: Create event.
 *        tags: [Events]
 *        requestBody:
 *          description: Event data
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Event'
 *              example:
 *                name: "New Event"
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
router.post("/", EventController.create);

/**
 * @openapi
 *  paths:
 *    /events/{eventId}:
 *      patch:
 *        summary: Update event.
 *        tags: [Events]
 *        parameters:
 *          - $ref: '#/components/parameters/eventId'
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
router.patch("/:id", EventController.update);

/**
 * @openapi
 *  paths:
 *    /events/{eventId}:
 *      delete:
 *        summary: Delete event.
 *        tags: [Events]
 *        parameters:
 *          - $ref: '#/components/parameters/eventId'
 *        responses:
 *          '204':
 *            description: Event has been deleted
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.delete("/:id", EventController.deleteById);

// Router for /events/:id/categories
router.use("/:id/categories", categoriesRouter);
categoriesRouter.param("categoryId", GenericController.validateObjectId);
categoriesRouter.param("categoryId", EventController.validateCategory);

/**
 * @openapi
 *  paths:
 *    /events/{eventId}/categories:
 *      get:
 *        summary: Get a list of categories assigned to the event.
 *        tags: [Events]
 *        responses:
 *          '200':
 *            description: A JSON array of categories
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Category'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            description: Event not found
 *            $ref: '#/components/responses/NotFound'
 */
categoriesRouter.get("/", EventController.getAllCategories);

/**
 * @openapi
 *  paths:
 *    /events/{eventId}/categories/{categoryId}:
 *      delete:
 *        summary: Unassign a category from the event.
 *        tags: [Events]
 *        parameters:
 *          - $ref: '#/components/parameters/categoryId'
 *        responses:
 *          '204':
 *            description: Category has been unassigned
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            description: Event or category with this id was not found
 *            $ref: '#/components/responses/NotFound'
 */
categoriesRouter.delete("/:categoryId", EventController.deleteCategory);

/**
 * @openapi
 *  paths:
 *    /events/{eventId}/categories/{categoryId}:
 *      put:
 *        summary: Assign a category to the event.
 *        tags: [Events]
 *        parameters:
 *          - $ref: '#/components/parameters/categoryId'
 *        responses:
 *          '201':
 *            description: Category assigned to the event
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            description: Event or category with this id was not found
 *            $ref: '#/components/responses/NotFound'
 */
categoriesRouter.put("/:categoryId", EventController.addCategory);

// Router for /events/:id/location
router.use("/:id/location", locationRouter);
locationRouter.param("locationId", GenericController.validateObjectId);
locationRouter.param("locationId", EventController.validateLocation);

/**
 * @openapi
 *  paths:
 *    /events/{eventId}/location:
 *      get:
 *        summary: Get the location assigned to the event
 *        tags: [Events]
 *        responses:
 *          '200':
 *            description: A location id
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Location'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            description: Event not found
 *            $ref: '#/components/responses/NotFound'
 */
locationRouter.get("/", EventController.getLocation);

/**
 * @openapi
 *  paths:
 *    /events/{eventId}/location:
 *      delete:
 *        summary: Unassign a location from the event.
 *        tags: [Events]
 *        responses:
 *          '204':
 *            description: Location has been unassigned
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            description: Event not found
 *            $ref: '#/components/responses/NotFound'
 */
locationRouter.delete("/", EventController.deleteLocation);

/**
 * @openapi
 *  paths:
 *    /events/{eventId}/location/{locationId}:
 *      put:
 *        summary: Assign a location to the event.
 *        tags: [Events]
 *        parameters:
 *          - $ref: '#/components/parameters/locationId'
 *        responses:
 *          '201':
 *            description: Location assigned to the event
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            description: Event or location with this id was not found
 *            $ref: '#/components/responses/NotFound'
 */
locationRouter.put("/:locationId", EventController.addLocation);

export default router;
