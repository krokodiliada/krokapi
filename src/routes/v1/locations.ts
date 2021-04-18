/**
 * @openapi
 *  tags:
 *    name: Locations
 *    description: API to manage locations.
 */

/**
 * @openapi
 *  components:
 *    schemas:
 *      Location:
 *        type: object
 *        required:
 *          - name
 *        properties:
 *          name:
 *            type: string
 *            description: The short name of the location
 *          latitude:
 *            type: number
 *            description: Location's latitude
 *          longitude:
 *            type: number
 *            description: Location's longitude
 *          description:
 *            type: string
 *            description: Full description of the location
 *          water:
 *            type: boolean
 *            description: True if location is used for the water stage of the
 *                         competition. For such locations there is no
 *                         GPS location required to be set and locations are
 *                         rather considered placeholders.
 *          note:
 *            type: string
 *            description: A short note for the location
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
 *          latitude: 55.825135
 *          longitude: 39.212493
 *          description: "Beautiful tree 30 degrees to the right of the road"
 *          water: false
 *          note: "There are two trees, we pick the closest one"
 *          createdAt: "2019-09-22T06:00:00.000Z"
 *          updatedAt: "2019-09-22T06:00:00.000Z"
 *    parameters:
 *      water:
 *        in: query
 *        name: water
 *        schema:
 *          type: boolean
 *        required: false
 *        description:
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
import LocationController from "controller/Location";

// Router for /locations/ api
const router = express.Router();

router.param("id", GenericController.validateObjectId);
router.param("id", LocationController.validateLocationExists);

// Router for /locations/

/**
 * @openapi
 *  paths:
 *    /locations:
 *      get:
 *        summary: Get a list of locations.
 *        tags: [Locations]
 *        parameters:
 *          - $ref: '#/components/parameters/water'
 *        responses:
 *          '200':
 *            description: A JSON array of all locations
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Location'
 *                  example:
 *                    [
 *                      {
 *                        _id: "5f8f83f6b54764421b715eea",
 *                        name: "Next to the road",
 *                        latitude: 55.892334,
 *                        longitude: 39.328505,
 *                        description: "Beautiful tree 30 degrees to the right of the road",
 *                        water: false,
 *                        note: "There are two trees, we pick the closest one",
 *                        createdAt: "2019-09-22T06:00:00.000Z",
 *                        updatedAt: "2019-09-22T06:00:00.000Z"
 *                      }
 *                    ]
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
 *                example:
 *                  {
 *                    _id: "5f8f83f6b54764421b715eea",
 *                    name: "Next to the road",
 *                    latitude: 55.892334,
 *                    longitude: 39.328505,
 *                    description: "Beautiful tree 30 degrees to the right of the road",
 *                    water: false,
 *                    note: "There are two trees, we pick the closest one",
 *                    createdAt: "2019-09-22T06:00:00.000Z",
 *                    updatedAt: "2019-09-22T06:00:00.000Z"
 *                  }
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
 *    /locations:
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
 *                name: "New Location"
 *                latitude: 55.892334
 *                longitude: 39.328505
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
 *          description: Location data to update
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Location'
 *              example:
 *                name: "New Location Name"
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
