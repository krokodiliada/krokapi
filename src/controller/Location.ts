import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import Location, { ILocation } from "model/Location";
import utils from "utils";

const validateLocationExists: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedId = req.params.id;

  const location: ILocation | null = await Location.findById(requestedId);

  if (!location) {
    return res.status(StatusCodes.NOT_FOUND).json({});
  }

  return next();
};

// GET /locations/
const getAll: RequestHandler = async (req: Request, res: Response) => {
  let filter = {};
  if (req.query.water) {
    const isWater: boolean =
      (req.query.water as string).toLowerCase() === "true";
    filter = {
      water: isWater,
    };
  }

  const locations: Array<ILocation> = await Location.find().where(filter);
  res.status(StatusCodes.OK).json(locations);
};

// GET /locations/:id
const getById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const location: ILocation | null = await Location.findById(requestedId);

  if (location) {
    res.status(StatusCodes.OK).json(location);
  }
};

// PUT /locations/
const create: RequestHandler = async (req: Request, res: Response) => {
  const data = req.body;
  const version = utils.extractVersionFromUrl(req.originalUrl);

  Location.create(data)
    .then((location: ILocation) =>
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

  const location: ILocation | null = await Location.findById(requestedId);

  if (!location) {
    return;
  }

  location
    .set(req.body)
    .save()
    .then(() => res.status(StatusCodes.OK).json(location))
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

// DELETE /locations/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const location: ILocation | null = await Location.findById(requestedId);

  if (location) {
    Location.deleteOne(location)
      .then(() => res.status(StatusCodes.NO_CONTENT).send())
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
