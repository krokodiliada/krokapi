import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import Station, { IStation } from "model/Station";
import Errors from "Errors";
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
    return res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Stations.DOES_NOT_EXIST,
    });
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

// PUT /stations/:number
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
    .catch((error) => {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    });
};

// PATCH /stations/:number
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedNumber = Number(req.params.number);

  if (Object.keys(req.body).length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: Errors.EMPTY_REQUEST_BODY,
    });
    return;
  }

  const station: IStation | null = await Station.findOne({
    number: requestedNumber,
  });

  if (station) {
    station
      .set(req.body)
      .save()
      .then(() => res.status(StatusCodes.OK).json(station))
      .catch((error) => {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
      });
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
      .catch(() =>
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: Errors.INTERNAL_SERVER_ERROR,
        })
      );
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
