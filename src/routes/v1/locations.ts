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
 *            description: The name of the event
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
router.get("/", LocationController.getAll);
router.get("/:id", LocationController.getById);
router.post("/", LocationController.create);
router.patch("/:id", LocationController.update);
router.delete("/:id", LocationController.deleteById);

export default router;
