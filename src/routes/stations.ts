import express from "express";
import GenericController from "controller/Common";
import StationController from "controller/Station";

// Router for /stations/ api
const router = express.Router();

router.param("number", GenericController.validateNumber);
router.param("number", StationController.validateStationExists);

// Router for /stations/
router.get("/", StationController.getAll);
router.get("/:number", StationController.getById);
router.put("/:number", StationController.create);
router.patch("/:number", StationController.update);
router.delete("/:number", StationController.deleteById);

export default router;
