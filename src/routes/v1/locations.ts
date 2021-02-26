/**
 * @openapi
 *  tags:
 *    name: Locations
 *    description: API to manage GPS locations.
 */

/**
 * @openapi
 *  components:
 *    schemas:
 *      Location:
 *        type: object
 *        required:
 *          - name
 *          - latitude
 *          - longitude
 *        properties:
 *          name:
 *            type: string
 *            description: The short name of the location
 *          latitude:
 *            type: number
 *            description: Locations' latitude
 *          longitude:
 *            type: number
 *            description: Location's longitude
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
 *          name: "Random location"
 *          latitude: 55.873966
 *          longitude: 39.362529
 *          createdAt: "2019-09-22T06:00:00.000Z"
 *          updatedAt: "2019-09-22T06:00:00.000Z"
 *    parameters:
 *      locationId:
 *        in: path
 *        name: locationId
 *        schema:
 *          type: string
 *        required: true
 *        description: Unique identifier of the location
 */

import express from "express";
import GenericController from "controller/Common";
import LocationController from "controller/GpsLocation";

// Router for /locations/ api
const router = express.Router();

router.param("id", GenericController.validateObjectId);
router.param("id", LocationController.validateLocationExists);

// Disallow the following methods
router.post("/:id", GenericController.disallowMethod);

// Router for /locations/

/**
 * @openapi
 *  paths:
 *    /locations:
 *      get:
 *        summary: Get a list of locations.
 *        tags: [Locations]
 *        responses:
 *          '200':
 *            description: A JSON array of GPS locations
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Location'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 */
router.get("/", LocationController.getAll);

/**
 * @openapi
 *  paths:
 *    /locations/{locationId}:
 *      get:
 *        summary: Get information about a single location.
 *        tags: [Locations]
 *        parameters:
 *          - $ref: '#/components/parameters/locationId'
 *        responses:
 *          '200':
 *            description: Location data
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Location'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.get("/:id", LocationController.getById);

/**
 * @openapi
 *  paths:
 *    /locations/:
 *      post:
 *        summary: Create location.
 *        tags: [Locations]
 *        requestBody:
 *          description: Location data
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Location'
 *              example:
 *                name: "New GPS Location"
 *                latitude: 55.873966
 *                longitude: 39.362529
 *        responses:
 *          '201':
 *            description: Location created
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Location'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 */
router.post("/", LocationController.create);

/**
 * @openapi
 *  paths:
 *    /locations/{locationId}:
 *      patch:
 *        summary: Update location.
 *        tags: [Locations]
 *        parameters:
 *          - $ref: '#/components/parameters/locationId'
 *        requestBody:
 *          description: Location data
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Location'
 *              example:
 *                latitude: 55.873966
 *        responses:
 *          '200':
 *            description: Location updated
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Location'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.patch("/:id", LocationController.update);

/**
 * @openapi
 *  paths:
 *    /locations/{locationId}:
 *      delete:
 *        summary: Delete location.
 *        tags: [Locations]
 *        parameters:
 *          - $ref: '#/components/parameters/locationId'
 *        responses:
 *          '204':
 *            description: Location has been deleted
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.delete("/:id", LocationController.deleteById);

export default router;
