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
