/**
 * @openapi
 *  tags:
 *    name: Routes
 *    description: API to manage participant routes.
 */

/**
 * @openapi
 *  components:
 *    schemas:
 *      Route:
 *        type: object
 *        required:
 *          - tagAssignment
 *          - start
 *        properties:
 *          tagAssignment:
 *            type: string
 *            description: Unique id of a tag assignment
 *          start:
 *            type: string
 *            format: date
 *            description: Start datetime of the route
 *          finish:
 *            type: string
 *            format: date
 *            description: End datetime of the route
 *          actions:
 *            type: array
 *            items:
 *              type: object
 *              required:
 *                - station
 *                - timestamp
 *              properties:
 *                station:
 *                  type: string
 *                  description: Unique identifier of the station
 *                timestamp:
 *                  type: string
 *                  format: date
 *                  description: Timestamp when a participant's tag touched
 *                               the station
 *          createdAt:
 *            type: string
 *            format: date
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date
 *            description: The date when the record was last updated.
 *        example:
 *          _id: "5fd550a7b547649dd7e376e4"
 *          tagAssignment: "5fcc1bd5b5476485111184bf"
 *          start: "2019-09-22T06:00:00.000Z"
 *          finish: "2019-09-22T16:00:00.000Z"
 *          actions: [
 *            {
 *              station: "5f8f8c44b54764421b715f4b",
 *              timestamp: "2019-09-22T10:35:00.000Z",
 *            },
 *            {
 *              station: "5f8f8c44b54764421b715f48",
 *              timestamp: "2019-09-22T12:42:13.000Z",
 *            },
 *          ]
 *          createdAt: "2019-09-22T06:00:00.000Z"
 *          updatedAt: "2019-09-22T06:00:00.000Z"
 *    parameters:
 *      routeId:
 *        in: path
 *        name: routeId
 *        schema:
 *          type: string
 *        required: true
 *        description: Unique identifier of the route
 */

import express from "express";
import GenericController from "controller/Common";
import RouteController from "controller/Route";
import TagAssignmentController from "controller/TagAssignment";

// Router for /routes/ api
const router = express.Router();

router.param("id", GenericController.validateObjectId);
router.param("id", RouteController.validateRouteExists);
router.param("tagAssignmentId", GenericController.validateObjectId);
router.param(
  "tagAssignmentId",
  TagAssignmentController.validateAssignmentExists
);

/**
 * @openapi
 *  paths:
 *    /routes:
 *      get:
 *        summary: Get the list of routes.
 *        tags: [Routes]
 *        parameters:
 *          - in: query
 *            name: tagAssignment
 *            schema:
 *              type: string
 *            required: false
 *            description: Unique identifier of a tag assignment
 *        responses:
 *          '200':
 *            description: A JSON array of all routes
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Route'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.get("/", RouteController.getAll);

/**
 * @openapi
 *  paths:
 *    /routes/{routeId}:
 *      get:
 *        summary: Get information about a single route.
 *        tags: [Routes]
 *        parameters:
 *          - $ref: '#/components/parameters/routeId'
 *        responses:
 *          '200':
 *            description: Route data
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Route'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.get("/:id", RouteController.getById);

/**
 * @openapi
 *  paths:
 *    /routes:
 *      post:
 *        summary: Create route.
 *        tags: [Routes]
 *        requestBody:
 *          description: Route data
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Route'
 *              example:
 *                tagAssignment: "5fcc1bd5b5476485111184bf"
 *                start: "2019-09-22T06:00:00.000Z"
 *        responses:
 *          '201':
 *            description: Route created
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Route'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 */
router.post("/", RouteController.create);

/**
 * @openapi
 *  paths:
 *    /routes/{routeId}:
 *      patch:
 *        summary: Update route.
 *        tags: [Routes]
 *        parameters:
 *          - $ref: '#/components/parameters/routeId'
 *        requestBody:
 *          description: Route data to update
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Route'
 *              example:
 *                finish: "2019-09-22T16:00:00.000Z"
 *        responses:
 *          '200':
 *            description: Route updated
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Route'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.patch("/:id", RouteController.update);

/**
 * @openapi
 *  paths:
 *    /routes/{routeId}:
 *      delete:
 *        summary: Delete route.
 *        tags: [Routes]
 *        parameters:
 *          - $ref: '#/components/parameters/routeId'
 *        responses:
 *          '204':
 *            description: Route has been deleted
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.delete("/:id", RouteController.deleteById);

/**
 * @openapi
 *  paths:
 *    /routes/{routeId}/actions:
 *      put:
 *        summary: Update route actions.
 *        tags: [Routes]
 *        parameters:
 *          - $ref: '#/components/parameters/routeId'
 *        requestBody:
 *          description: Actions data to set
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Route'
 *              example:
 *                actions: [
 *                  {
 *                    station: "5f8f8c44b54764421b715f4b",
 *                    timestamp: "2019-09-22T10:35:00.000Z",
 *                  },
 *                  {
 *                    station: "5f8f8c44b54764421b715f48",
 *                    timestamp: "2019-09-22T12:42:13.000Z",
 *                  },
 *                ]
 *        responses:
 *          '200':
 *            description: Route updated
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Route'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.put("/:id/actions", RouteController.createActions);

export default router;
