import express from "express";
import KrokController from "controller/Krok";
import GenericController from "controller/Common";

// Krok Router
const router = express.Router();
const categoriesRouter = express.Router({ mergeParams: true });
const locationRouter = express.Router({ mergeParams: true });

router.param("number", KrokController.validateKrokIsNumber);
router.param("number", KrokController.validateKrokExists);

// Disallow the following methods
router.post("/", GenericController.disallowMethod);
router.post("/:number", GenericController.disallowMethod);
router.put("/", GenericController.disallowMethod);
router.delete("/", GenericController.disallowMethod);

// Router for /kroks/
router.get("/", KrokController.getAll);
router.get("/:number", KrokController.getByNumber);
router.put("/:number", KrokController.create);
router.patch("/:number", KrokController.update);
router.delete("/:number", KrokController.deleteByNumber);

// Router for /kroks/:number/categories
router.use("/:number/categories", categoriesRouter);
categoriesRouter.param("categoryId", KrokController.validateCategory);

categoriesRouter.get("/", KrokController.getAllCategories);
categoriesRouter.delete("/:categoryId", KrokController.deleteCategory);
categoriesRouter.put("/:categoryId", KrokController.addCategory);

// Router for /kroks/:number/location
router.use("/:number/location", locationRouter);
locationRouter.param("locationId", KrokController.validateLocation);

locationRouter.get("/", KrokController.getLocation);
locationRouter.delete("/", KrokController.deleteLocation);
locationRouter.put("/:locationId", KrokController.addLocation);

export default router;
