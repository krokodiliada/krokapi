import express from "express";
import KrokController from "controller/Krok";
import GenericController from "controller/Common";

// Router for /kroks/ api
const router = express.Router();

router.get("/", KrokController.getAll);
router.get("/:number", KrokController.getByNumber);

router.post("/", GenericController.disallowMethod);
router.post("/:number", GenericController.disallowMethod);

router.put("/:number", KrokController.create);

router.patch("/:number", KrokController.update);

router.delete("/:number", KrokController.deleteByNumber);

export default router;
