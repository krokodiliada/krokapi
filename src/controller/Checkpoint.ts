import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import Checkpoint, { ICheckpoint } from "model/Checkpoint";
import utils from "utils";

const validateAssignmentExists: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedId = req.params.id;

  const assignment: ICheckpoint | null = await Checkpoint.findById(requestedId);

  if (!assignment) {
    return res.status(StatusCodes.NOT_FOUND).json({});
  }

  return next();
};

// GET /checkpoint-assignments/
const getAll: RequestHandler = async (_: Request, res: Response) => {
  const assignments: Array<ICheckpoint> = await Checkpoint.find();
  res.status(StatusCodes.OK).json(assignments);
};

// GET /checkpoint-assignments/:id
const getById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const assignment: ICheckpoint | null = await Checkpoint.findById(requestedId);

  if (assignment) {
    res.status(StatusCodes.OK).json(assignment);
  }
};

// PUT /checkpoint-assignments/
const create: RequestHandler = async (req: Request, res: Response) => {
  const data = req.body;
  const version = utils.extractVersionFromUrl(req.originalUrl);

  const newAssignment: ICheckpoint = new Checkpoint(data);

  Checkpoint.create(newAssignment)
    .then((assignment: ICheckpoint) =>
      res
        .status(StatusCodes.CREATED)
        .set("Location", `/${version}/checkpoint-assignments/${assignment._id}`)
        .json(assignment)
    )
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

// PATCH /checkpoint-assignments/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const assignment: ICheckpoint | null = await Checkpoint.findById(requestedId);

  if (assignment) {
    assignment
      .set(req.body)
      .save()
      .then(() => res.status(StatusCodes.OK).json(assignment))
      .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
  }
};

// DELETE /checkpoint-assignments/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const assignment: ICheckpoint | null = await Checkpoint.findById(requestedId);

  if (assignment) {
    Checkpoint.deleteOne(assignment)
      .then(() => res.status(StatusCodes.NO_CONTENT).send())
      .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({}));
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
