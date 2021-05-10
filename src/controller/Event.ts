import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import Category, { ICategory } from "model/Category";
import Event, { IEvent } from "model/Event";
import Location, { ILocation } from "model/Location";
import Errors from "controller/Errors";
import utils from "utils";

/**
 * Validate event :id parameter
 */
const eventIdExists = async (id: string): Promise<boolean> => {
  const event: IEvent | null = await Event.findById(id);

  if (!event) {
    return false;
  }

  return true;
};

const validateEventExists: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedId = req.params.id;

  const event: IEvent | null = await Event.findById(requestedId);

  // If inserting inexisting event, then PUT should be allowed.
  if (!event) {
    return res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Events.DOES_NOT_EXIST,
    });
  }

  return next();
};

/**
 * Validate event category :categoryId parameter
 */
const validateCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedEventId = req.params.id;
  const requestedCategoryId = req.params.categoryId;

  const event: IEvent | null = await Event.findById(requestedEventId);

  if (
    req.method !== "PUT" &&
    !event?.categories.includes(requestedCategoryId)
  ) {
    return res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Events.DOES_NOT_HAVE_CATEGORY,
    });
  }

  if (req.method === "PUT" || req.method === "POST") {
    const category: ICategory | null = await Category.findById(
      requestedCategoryId
    );

    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: Errors.Events.CATEGORY_DOES_NOT_EXIST,
      });
    }
  }

  return next();
};

/**
 * Validate event location :locationId parameter
 * locationId is only specified for PUT method
 */
const validateLocation: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedLocationId = req.params.locationId;

  const location: ILocation | null = await Location.findById(
    requestedLocationId
  );

  if (!location) {
    return res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Events.LOCATION_DOES_NOT_EXIST,
    });
  }

  return next();
};

// GET /events/
const getAll: RequestHandler = async (_: Request, res: Response) => {
  const events: Array<IEvent> = await Event.find().populate({
    path: "categories",
    model: "Category",
  });

  res.status(StatusCodes.OK).json(events);
};

// GET /events/:id
const getById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const event: IEvent | null = await Event.findById(requestedId).populate({
    path: "categories",
    model: "Category",
  });

  if (event) {
    res.status(StatusCodes.OK).json(event);
  }
};

// POST /events/
const create: RequestHandler = async (req: Request, res: Response) => {
  const data = req.body;
  const version = utils.extractVersionFromUrl(req.originalUrl);

  const newEvent: IEvent = new Event(data);

  Event.create(newEvent)
    .then((event: IEvent) =>
      res
        .status(StatusCodes.CREATED)
        .set("Location", `/${version}/events/${event._id}`)
        .json(event)
    )
    .catch((error) => {
      if (error.message) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: Errors.INTERNAL_SERVER_ERROR,
        });
      }
    });
};

// PATCH /events/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  if (Object.keys(req.body).length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: Errors.EMPTY_REQUEST_BODY,
    });
    return;
  }

  const event: IEvent | null = await Event.findById(requestedId);

  if (event) {
    event
      .set(req.body)
      .save()
      .then((updatedEvent: IEvent) =>
        res.status(StatusCodes.OK).json(updatedEvent)
      )
      .catch((error) => {
        if (error.message) {
          res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        } else {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: Errors.INTERNAL_SERVER_ERROR,
          });
        }
      });
  }
};

// DELETE /events/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const event: IEvent | null = await Event.findById(requestedId);

  if (event) {
    Event.deleteOne(event)
      .then(() => res.status(StatusCodes.NO_CONTENT).send())
      .catch(() =>
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: Errors.INTERNAL_SERVER_ERROR,
        })
      );
  }
};

// GET /events/:id/categories
const getAllCategories: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestedEventId = req.params.id;

  const event: IEvent | null = await Event.findById(requestedEventId);

  if (event) {
    const categories: Array<ICategory> = await Category.find({
      _id: event.categories,
    });

    res.status(StatusCodes.OK).json(categories);
  }
};

// DELETE /events/:id/categories/:categoryId
const deleteCategory: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventId = req.params.id;
  const requestedCategoryId: string = req.params.categoryId;

  const event: IEvent | null = await Event.findById(requestedEventId);

  if (event) {
    const categoryIndex = event.categories.indexOf(requestedCategoryId, 0);
    if (categoryIndex > -1) {
      event.categories.splice(categoryIndex, 1);
    }

    event
      .save()
      .then(() => {
        res.status(StatusCodes.NO_CONTENT).send();
      })
      .catch(() => {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: Errors.INTERNAL_SERVER_ERROR });
      });
  }
};

// PUT /events/:id/categories/:categoryId
const addCategory: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventId = req.params.id;
  const requestedCategoryId: string = req.params.categoryId;

  const event: IEvent | null = await Event.findById(requestedEventId);

  if (!event) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Events.DOES_NOT_EXIST,
    });
    return;
  }

  if (!event.categories.includes(requestedCategoryId)) {
    event.categories.push(requestedCategoryId);
  }

  event
    .save()
    .then(() => {
      res.status(StatusCodes.OK).send();
    })
    .catch(() => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: Errors.INTERNAL_SERVER_ERROR,
      });
    });
};

// GET /events/:id/location
const getLocation: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventId = req.params.id;

  const event: IEvent | null = await Event.findById(requestedEventId);

  if (!event) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Events.DOES_NOT_EXIST,
    });
    return;
  }

  if (event.location) {
    const location: ILocation | null = await Location.findById(
      event.location._id
    );

    if (location) {
      res.status(StatusCodes.OK).json(location);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: Errors.INTERNAL_SERVER_ERROR,
      });
    }
  } else {
    res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Events.LOCATION_IS_NOT_ASSIGNED,
    });
  }
};

// DELETE /events/:id/location
const deleteLocation: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventId = req.params.id;

  const event: IEvent | null = await Event.findById(requestedEventId);

  if (!event) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Events.DOES_NOT_EXIST,
    });
    return;
  }

  if (!event.location) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Events.LOCATION_IS_NOT_ASSIGNED,
    });
    return;
  }

  delete event.location;

  event
    .save()
    .then(() => {
      res.status(StatusCodes.NO_CONTENT).send();
    })
    .catch(() => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: Errors.INTERNAL_SERVER_ERROR,
      });
    });
};

// PUT /events/:id/location/:locationId
const addLocation: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventId = req.params.id;
  const requestedLocationId = req.params.locationId;

  const event: IEvent | null = await Event.findById(requestedEventId);

  if (!event) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Events.DOES_NOT_EXIST,
    });
    return;
  }

  event.location = requestedLocationId;

  event
    .save()
    .then(() => {
      res.status(StatusCodes.OK).send();
    })
    .catch(() => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: Errors.INTERNAL_SERVER_ERROR,
      });
    });
};

export default {
  eventIdExists,
  validateEventExists,
  validateCategory,
  validateLocation,
  getAll,
  getById,
  create,
  update,
  deleteById,
  getAllCategories,
  deleteCategory,
  addCategory,
  getLocation,
  deleteLocation,
  addLocation,
};
