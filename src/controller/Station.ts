import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import Station, { IStation } from "model/Station";
import utils from "utils";

const validateStationExists: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedNumber = Number(req.params.number);

  const station: IStation | null = await Station.findOne({
    number: requestedNumber,
  });

  // If inserting inexisting station, then PUT should be allowed.
  if (!station && req.method !== "PUT") {
    return res.status(StatusCodes.NOT_FOUND).json({});
  }

  return next();
};

// GET /stations/
const getAll: RequestHandler = async (_: Request, res: Response) => {
  const stations: Array<IStation> = await Station.find();
  res.status(StatusCodes.OK).json(stations);
};

// GET /stations/:number
const getByNumber: RequestHandler = async (req: Request, res: Response) => {
  const requestedNumber = Number(req.params.number);

  const station: IStation | null = await Station.findOne({
    number: requestedNumber,
  });

  if (station) {
    res.status(StatusCodes.OK).json(station);
  }
};

// PUT /stations/
const create: RequestHandler = async (req: Request, res: Response) => {
  const requestedNumber = Number(req.params.number);
  const version = utils.extractVersionFromUrl(req.originalUrl);
  const data = req.body;
  data.number = requestedNumber;

  const newStation: IStation = new Station(data);

  Station.create(newStation)
    .then((station: IStation) =>
      res
        .status(StatusCodes.CREATED)
        .set("Location", `/${version}/stations/${station._id}`)
        .json(station)
    )
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

// PATCH /stations/:number
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedNumber = Number(req.params.number);

  const station: IStation | null = await Station.findOne({
    number: requestedNumber,
  });

  if (station) {
    station
      .set(req.body)
      .save()
      .then(() => res.status(StatusCodes.OK).json(station))
      .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
  }
};

// DELETE /stations/:number
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedNumber = Number(req.params.number);

  const station: IStation | null = await Station.findOne({
    number: requestedNumber,
  });

  if (station) {
    Station.deleteOne(station)
      .then(() => res.status(StatusCodes.NO_CONTENT).send())
      .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({}));
  }
};

export default {
  validateStationExists,
  getAll,
  getByNumber,
  create,
  update,
  deleteById,
};
