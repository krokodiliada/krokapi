import express from "express";
import CategoryController from "controller/Category";
import GenericController from "controller/Common";

// Categories router
const router = express.Router();

router.param("id", GenericController.validateObjectId);
router.param("id", CategoryController.validateCategoryExists);

// Router for /categories/
router.get("/", CategoryController.getAll);
router.get("/:id", CategoryController.getById);
router.post("/", CategoryController.create);
router.patch("/:id", CategoryController.update);
router.delete("/:id", CategoryController.deleteById);

export default router;
