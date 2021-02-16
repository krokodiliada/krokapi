import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import GpsLocation, { IGpsLocation } from "model/GpsLocation";
import utils from "utils";

const validateLocationExists: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedId = req.params.id;

  const location: IGpsLocation | null = await GpsLocation.findById(requestedId);

  if (!location) {
    return res.status(StatusCodes.NOT_FOUND).json({});
  }

  return next();
};

// GET /locations/
const getAll: RequestHandler = async (_: Request, res: Response) => {
  const locations: Array<IGpsLocation> = await GpsLocation.find();
  res.status(StatusCodes.OK).json(locations);
};

// GET /locations/:id
const getById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const location: IGpsLocation | null = await GpsLocation.findById(requestedId);

  if (location) {
    res.status(StatusCodes.OK).json(location);
  }
};

// PUT /locations/
const create: RequestHandler = async (req: Request, res: Response) => {
  const data = req.body;
  const version = utils.extractVersionFromUrl(req.originalUrl);

  const newLocation: IGpsLocation = new GpsLocation(data);

  GpsLocation.create(newLocation)
    .then((location: IGpsLocation) =>
      res
        .status(StatusCodes.CREATED)
        .set("Location", `/${version}/locations/${location._id}`)
        .json(location)
    )
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

// PATCH /locations/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const location: IGpsLocation | null = await GpsLocation.findById(requestedId);

  if (location) {
    location
      .set(req.body)
      .save()
      .then(() => res.status(StatusCodes.OK).json())
      .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
  }
};

// DELETE /locations/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const location: IGpsLocation | null = await GpsLocation.findById(requestedId);

  if (location) {
    GpsLocation.deleteOne(location)
      .then(() => res.status(StatusCodes.OK).json({}))
      .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({}));
  }
};

export default {
  validateLocationExists,
  getAll,
  getById,
  create,
  update,
  deleteById,
};
