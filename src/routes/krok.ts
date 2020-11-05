import express from "express";
import * as KrokController from "controller/Krok";

const router = express.Router();

// router.get("/kroks/:number", KrokController.getByNumber);
router.get("/kroks/:number", (_, res) => {
  console.log("Trying to get by number!");
  res.status(200).json({ answer: 42 });
});
router.post("/kroks/", KrokController.create);
router.delete("/kroks/:number", KrokController.deleteByNumber);

export default router;
