import express from "express";
import EventController from "controller/Event";
import GenericController from "controller/Common";

// Event Router
const router = express.Router();
const categoriesRouter = express.Router({ mergeParams: true });
const locationRouter = express.Router({ mergeParams: true });

router.param("number", GenericController.validateNumber);
router.param("number", EventController.validateEventExists);

// Disallow the following methods
router.post("/", GenericController.disallowMethod);
router.post("/:number", GenericController.disallowMethod);
router.put("/", GenericController.disallowMethod);
router.delete("/", GenericController.disallowMethod);

// Router for /events/
router.get("/", EventController.getAll);
router.get("/:number", EventController.getByNumber);
router.put("/:number", EventController.create);
router.patch("/:number", EventController.update);
router.delete("/:number", EventController.deleteByNumber);

// Router for /events/:number/categories
router.use("/:number/categories", categoriesRouter);
categoriesRouter.param("categoryId", EventController.validateCategory);

categoriesRouter.get("/", EventController.getAllCategories);
categoriesRouter.delete("/:categoryId", EventController.deleteCategory);
categoriesRouter.put("/:categoryId", EventController.addCategory);

// Router for /events/:number/location
router.use("/:number/location", locationRouter);
locationRouter.param("locationId", EventController.validateLocation);

locationRouter.get("/", EventController.getLocation);
locationRouter.delete("/", EventController.deleteLocation);
locationRouter.put("/:locationId", EventController.addLocation);

export default router;
