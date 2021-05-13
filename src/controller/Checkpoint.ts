import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import Checkpoint, { ICheckpoint } from "model/Checkpoint";
import Errors from "Errors";
import utils from "utils";

const validateAssignmentExists: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedId = req.params.id;

  const checkpoint: ICheckpoint | null = await Checkpoint.findById(requestedId);

  if (!checkpoint) {
    return res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Checkpoints.DOES_NOT_EXIST,
    });
  }

  return next();
};

// GET /checkpoints/
const getAll: RequestHandler = async (_: Request, res: Response) => {
  const checkpoints: Array<ICheckpoint> = await Checkpoint.find();
  res.status(StatusCodes.OK).json(checkpoints);
};

// GET /checkpoints/:id
const getById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const checkpoint: ICheckpoint | null = await Checkpoint.findById(requestedId);

  if (checkpoint) {
    res.status(StatusCodes.OK).json(checkpoint);
  }
};

// PUT /checkpoints/
const create: RequestHandler = async (req: Request, res: Response) => {
  const data = req.body;
  const version = utils.extractVersionFromUrl(req.originalUrl);

  const newAssignment: ICheckpoint = new Checkpoint(data);

  Checkpoint.create(newAssignment)
    .then((checkpoint: ICheckpoint) =>
      res
        .status(StatusCodes.CREATED)
        .set("Location", `/${version}/checkpoints/${checkpoint._id}`)
        .json(checkpoint)
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

// PATCH /checkpoints/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const checkpoint: ICheckpoint | null = await Checkpoint.findById(requestedId);

  if (checkpoint) {
    checkpoint
      .set(req.body)
      .save()
      .then(() => res.status(StatusCodes.OK).json(checkpoint))
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

// DELETE /checkpoints/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const checkpoint: ICheckpoint | null = await Checkpoint.findById(requestedId);

  if (checkpoint) {
    Checkpoint.deleteOne(checkpoint)
      .then(() => res.status(StatusCodes.NO_CONTENT).send())
      .catch(() =>
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: Errors.INTERNAL_SERVER_ERROR,
        })
      );
  }
};

export default {
  validateAssignmentExists,
  getAll,
  getById,
  create,
  update,
  deleteById,
};
