/**
 * @openapi
 *  tags:
 *    name: Stations
 *    description: API to manage stations.
 */

/**
 * @openapi
 *  components:
 *    schemas:
 *      Station:
 *        type: object
 *        required:
 *          - number
 *        properties:
 *          number:
 *            type: integer
 *            minimum: 0
 *            maximum: 65536
 *            exclusiveMaximum: true
 *            description: Station number [0-65536)
 *          enabled:
 *            type: boolean
 *            description: True if station is enabled. False if disabled
 *          stationType:
 *            type: string
 *            enum: [regular, start, finish, clear]
 *            description: Station type
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
 *          number: 35
 *          enabled: true,
 *          stationType: "regular"
 *          createdAt: "2019-09-22T06:00:00.000Z"
 *          updatedAt: "2019-09-22T06:00:00.000Z"
 *    parameters:
 *      stationNumber:
 *        in: path
 *        name: stationNumber
 *        schema:
 *          type: integer
 *        required: true
 *        description: Unique station number
 */

import express from "express";
import GenericController from "controller/Common";
import StationController from "controller/Station";

// Router for /stations/ api
const router = express.Router();

router.param("number", GenericController.validateNumber);
router.param("number", StationController.validateStationExists);

// Router for /stations/

/**
 * @openapi
 *  paths:
 *    /stations:
 *      get:
 *        summary: Get a list of stations.
 *        tags: [Stations]
 *        responses:
 *          '200':
 *            description: A JSON array of stations
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Station'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 */
router.get("/", StationController.getAll);

/**
 * @openapi
 *  paths:
 *    /stations/{stationNumber}:
 *      get:
 *        summary: Get information about a single station.
 *        tags: [Stations]
 *        parameters:
 *          - $ref: '#/components/parameters/stationNumber'
 *        responses:
 *          '200':
 *            description: Station data
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Station'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.get("/:number", StationController.getByNumber);

/**
 * @openapi
 *  paths:
 *    /stations/{stationNumber}:
 *      put:
 *        summary: Create station.
 *        tags: [Stations]
 *        parameters:
 *          - $ref: '#/components/parameters/stationNumber'
 *        requestBody:
 *          description: Station data
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Station'
 *              example:
 *                number: 35
 *        responses:
 *          '201':
 *            description: Station created
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Station'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.put("/:number", StationController.create);

/**
 * @openapi
 *  paths:
 *    /stations/{stationNumber}:
 *      patch:
 *        summary: Update station.
 *        tags: [Stations]
 *        parameters:
 *          - $ref: '#/components/parameters/stationNumber'
 *        requestBody:
 *          description: Station data
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Station'
 *              example:
 *                stationType: "regular"
 *        responses:
 *          '200':
 *            description: Station updated
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Station'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.patch("/:number", StationController.update);

/**
 * @openapi
 *  paths:
 *    /stations/{stationNumber}:
 *      delete:
 *        summary: Delete station.
 *        tags: [Stations]
 *        parameters:
 *          - $ref: '#/components/parameters/stationNumber'
 *        responses:
 *          '204':
 *            description: Station has been deleted
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.delete("/:number", StationController.deleteById);

export default router;
