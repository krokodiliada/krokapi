import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import Checkpoint, { ICheckpoint } from "model/Checkpoint";
import utils from "utils";

const validateCheckpointExists: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedId = req.params.id;

  const checkpoint: ICheckpoint | null = await Checkpoint.findById(requestedId);

  if (!checkpoint) {
    return res.status(StatusCodes.NOT_FOUND).json({});
  }

  return next();
};

const hasUniqueLocation = async (checkpoint: ICheckpoint): Promise<boolean> => {
  const checkpoints: Array<ICheckpoint> = await Checkpoint.find().where({
    location: checkpoint.location,
  });

  if (
    checkpoints.length > 0 &&
    String(checkpoints[0]._id) !== String(checkpoint._id)
  ) {
    return false;
  }

  return true;
};

// GET /checkpoints/
const getAll: RequestHandler = async (req: Request, res: Response) => {
  let filter = {};
  if (req.query.water) {
    const isWater: boolean =
      (req.query.water as string).toLowerCase() === "true";
    filter = {
      water: isWater,
    };
  }

  const checkpoints: Array<ICheckpoint> = await Checkpoint.find()
    .where(filter)
    .populate("location");
  res.status(StatusCodes.OK).json(checkpoints);
};

// GET /checkpoints/:id
const getById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const checkpoint: ICheckpoint | null = await Checkpoint.findById(
    requestedId
  ).populate("location");

  if (checkpoint) {
    res.status(StatusCodes.OK).json(checkpoint);
  }
};

// PUT /checkpoints/
const create: RequestHandler = async (req: Request, res: Response) => {
  const data = req.body;
  const version = utils.extractVersionFromUrl(req.originalUrl);

  const newCheckpoint: ICheckpoint = new Checkpoint(data);

  newCheckpoint
    .validate()
    .then(async () => {
      const isUniqueLocation: boolean = await hasUniqueLocation(newCheckpoint);

      if (isUniqueLocation) {
        Checkpoint.create(newCheckpoint)
          .then((checkpoint: ICheckpoint) =>
            res
              .status(StatusCodes.CREATED)
              .set("Location", `/${version}/checkpoints/${checkpoint._id}`)
              .json(checkpoint)
          )
          .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({});
      }
    })
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

// PATCH /checkpoints/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const checkpoint: ICheckpoint | null = await Checkpoint.findById(requestedId);

  if (!checkpoint) {
    return;
  }

  checkpoint
    .set(req.body)
    .validate()
    .then(async () => {
      const isUniqueLocation: boolean = await hasUniqueLocation(checkpoint);

      if (isUniqueLocation) {
        checkpoint
          .save()
          .then(() => res.status(StatusCodes.OK).json(checkpoint))
          .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({});
      }
    })
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

// DELETE /checkpoints/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const checkpoint: ICheckpoint | null = await Checkpoint.findById(requestedId);

  if (checkpoint) {
    Checkpoint.deleteOne(checkpoint)
      .then(() => res.status(StatusCodes.NO_CONTENT).send())
      .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({}));
  }
};

export default {
  validateCheckpointExists,
  getAll,
  getById,
  create,
  update,
  deleteById,
};
