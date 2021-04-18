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
      error: "Event with this id does not exist",
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
      error: "Event does not have a category with this id",
    });
  }

  if (req.method === "PUT" || req.method === "POST") {
    const category: ICategory | null = await Category.findById(
      requestedCategoryId
    );

    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Category with this id does not exist",
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
      error: "Location with this id does not exist",
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
    .catch(() =>
      res.status(StatusCodes.BAD_REQUEST).json({
        error:
          "Could not create an event." +
          " Check your input data format and required fields",
      })
    );
};

// PATCH /events/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  if (Object.keys(req.body).length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: "No data to update with",
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
      .catch(() =>
        res.status(StatusCodes.BAD_REQUEST).json({
          error: "Could not update. Check your input data",
        })
      );
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
          error: Errors.internalServerError,
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
          .json({ error: Errors.internalServerError });
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
      error: "Event with this id does not exist",
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
        error: Errors.internalServerError,
      });
    });
};

// GET /events/:id/location
const getLocation: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventId = req.params.id;

  const event: IEvent | null = await Event.findById(requestedEventId);

  if (!event) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: "Event with this id does not exist",
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
        error: Errors.internalServerError,
      });
    }
  } else {
    res.status(StatusCodes.NOT_FOUND).json({
      error: "No location assigned to this event",
    });
  }
};

// DELETE /events/:id/location
const deleteLocation: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventId = req.params.id;

  const event: IEvent | null = await Event.findById(requestedEventId);

  if (!event) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: "Event with this id does not exist",
    });
    return;
  }

  if (!event.location) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: "No location assigned to this event",
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
        error: Errors.internalServerError,
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
      error: "Event with this id does not exist",
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
        error: Errors.internalServerError,
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
