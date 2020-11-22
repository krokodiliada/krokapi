import express from "express";
import * as KrokController from "controller/Krok";

// Router for /kroks/ api
const router = express.Router();

router.get("/:number", KrokController.getByNumber);
router.post("/", KrokController.create);
router.delete("/:number", KrokController.deleteByNumber);

export default router;
