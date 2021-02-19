import mongoose from "mongoose";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import Category, { ICategory } from "model/Category";
import Event, { IEvent } from "model/Event";
import GpsLocation, { IGpsLocation } from "model/GpsLocation";

/**
 * Validate event :number parameter
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
  const requestedEventNumber = Number(req.params.number);

  const event: IEvent | null = await Event.findOne({
    number: requestedEventNumber,
  });

  // If inserting inexisting event, then PUT should be allowed.
  if (!event && req.method !== "PUT") {
    return res.status(StatusCodes.NOT_FOUND).json({});
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
  const requestedEventNumber = Number(req.params.number);
  const requestedCategoryId = req.params.categoryId;

  const { ObjectId } = mongoose.Types;
  if (!ObjectId.isValid(requestedCategoryId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({});
  }

  const event: IEvent | null = await Event.findOne({
    number: requestedEventNumber,
  });

  if (
    req.method !== "PUT" &&
    !event?.categories.includes(requestedCategoryId)
  ) {
    return res.status(StatusCodes.NOT_FOUND).json({});
  }

  if (req.method === "PUT" || req.method === "POST") {
    const category: ICategory | null = await Category.findById(
      requestedCategoryId
    );

    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).json({});
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

  const { ObjectId } = mongoose.Types;
  if (!ObjectId.isValid(requestedLocationId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({});
  }

  const location: IGpsLocation | null = await GpsLocation.findById(
    requestedLocationId
  );

  if (!location) {
    return res.status(StatusCodes.NOT_FOUND).json({});
  }

  return next();
};

// GET /events/
const getAll: RequestHandler = async (_: Request, res: Response) => {
  const events: Array<IEvent> = await Event.find();

  res.status(StatusCodes.OK).json(events);
};

// GET /events/:number
const getByNumber: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventNumber = Number(req.params.number);

  const query = {
    number: requestedEventNumber,
  };

  const event: IEvent | null = await Event.findOne(query);

  if (event) {
    res.status(StatusCodes.OK).json(event);
  }
};

// PUT /events/:number
const create: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventNumber = Number(req.params.number);

  const query = req.body;
  query.number = requestedEventNumber;

  const event: IEvent | null = await Event.findOne({
    number: requestedEventNumber,
  });

  const newEvent: IEvent = new Event(query);

  if (event) {
    newEvent._id = event._id;

    event
      .set(newEvent)
      .save()
      .then((modifiedEvent: IEvent) =>
        res.status(StatusCodes.OK).json(modifiedEvent)
      )
      .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
  } else {
    Event.create(newEvent)
      .then((insertedEvent: IEvent) =>
        res.status(StatusCodes.CREATED).json(insertedEvent)
      )
      .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
  }
};

// PATCH /events/:number
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventNumber = Number(req.params.number);

  if (Object.keys(req.body).length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({});
    return;
  }

  const query = {
    number: requestedEventNumber,
  };

  const event: IEvent | null = await Event.findOne(query);

  if (event) {
    event
      .set(req.body)
      .save()
      .then((updatedEvent: IEvent) =>
        res.status(StatusCodes.OK).json(updatedEvent)
      )
      .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
  }
};

// DELETE /events/:number
const deleteByNumber: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventNumber = Number(req.params.number);

  const event: IEvent | null = await Event.findOne({
    number: requestedEventNumber,
  });

  if (event) {
    Event.deleteOne(event)
      .then(() => res.status(StatusCodes.NO_CONTENT).json({}))
      .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({}));
  }
};

// GET /events/:number/categories
const getAllCategories: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestedEventNumber = Number(req.params.number);

  const event: IEvent | null = await Event.findOne({
    number: requestedEventNumber,
  });

  if (event) {
    res.status(StatusCodes.OK).json({
      categories: event.categories,
    });
  }
};

// DELETE /events/:number/categories/:categoryId
const deleteCategory: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventNumber = Number(req.params.number);
  const requestedCategoryId: string = req.params.categoryId;

  const event: IEvent | null = await Event.findOne({
    number: requestedEventNumber,
  });

  if (event) {
    const categoryIndex = event.categories.indexOf(requestedCategoryId, 0);
    if (categoryIndex > -1) {
      event.categories.splice(categoryIndex, 1);
    }

    event
      .save()
      .then(() => {
        res.status(StatusCodes.OK).json({});
      })
      .catch(() => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
      });
  }
};

// PUT /events/:number/categories/:categoryId
const addCategory: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventNumber = Number(req.params.number);
  const requestedCategoryId: string = req.params.categoryId;

  const event: IEvent | null = await Event.findOne({
    number: requestedEventNumber,
  });

  if (!event) {
    res.status(StatusCodes.NOT_FOUND).json({});
    return;
  }

  if (!event.categories.includes(requestedCategoryId)) {
    event.categories.push(requestedCategoryId);
  }

  event
    .save()
    .then(() => {
      res.status(StatusCodes.OK).json({});
    })
    .catch(() => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
    });
};

// GET /events/:number/location
const getLocation: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventNumber = Number(req.params.number);

  const event: IEvent | null = await Event.findOne({
    number: requestedEventNumber,
  });

  if (!event) {
    return;
  }

  if (event.location) {
    const location: IGpsLocation | null = await GpsLocation.findById(
      event.location._id
    );

    if (location) {
      res.status(StatusCodes.OK).json(location);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
    }
  } else {
    res.status(StatusCodes.NOT_FOUND).json({});
  }
};

// DELETE /events/:number/location
const deleteLocation: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventNumber = Number(req.params.number);

  const event: IEvent | null = await Event.findOne({
    number: requestedEventNumber,
  });

  if (!event) {
    return;
  }

  if (!event.location) {
    res.status(StatusCodes.NOT_FOUND).json({});
    return;
  }

  delete event.location;

  event
    .save()
    .then(() => {
      res.status(StatusCodes.OK).json({});
    })
    .catch(() => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
    });
};

// PUT /events/:number/location/:locationId
const addLocation: RequestHandler = async (req: Request, res: Response) => {
  const requestedEventNumber = Number(req.params.number);
  const requestedLocationId = req.params.locationId;

  const event: IEvent | null = await Event.findOne({
    number: requestedEventNumber,
  });

  if (!event) {
    return;
  }

  event.location = requestedLocationId;

  event
    .save()
    .then(() => {
      res.status(StatusCodes.OK).json({});
    })
    .catch(() => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
    });
};

export default {
  eventIdExists,
  validateEventExists,
  validateCategory,
  validateLocation,
  getAll,
  getByNumber,
  create,
  update,
  deleteByNumber,
  getAllCategories,
  deleteCategory,
  addCategory,
  getLocation,
  deleteLocation,
  addLocation,
};
