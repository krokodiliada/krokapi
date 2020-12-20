import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import CheckpointAssignment, {
  ICheckpointAssignment,
} from "model/CheckpointAssignment";

const validateAssignmentExists: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedId = req.params.id;

  const assignment: ICheckpointAssignment | null = await CheckpointAssignment.findById(
    requestedId
  );

  if (!assignment) {
    return res.status(StatusCodes.NOT_FOUND).json({});
  }

  return next();
};

// GET /checkpoint-assignments/
const getAll: RequestHandler = async (_: Request, res: Response) => {
  const assignments: Array<ICheckpointAssignment> = await CheckpointAssignment.find();
  res.status(StatusCodes.OK).json(assignments);
};

// GET /checkpoint-assignments/:id
const getById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const assignment: ICheckpointAssignment | null = await CheckpointAssignment.findById(
    requestedId
  );

  if (assignment) {
    res.status(StatusCodes.OK).json(assignment);
  }
};

// PUT /checkpoint-assignments/
const create: RequestHandler = async (req: Request, res: Response) => {
  const data = req.body;

  const newAssignment: ICheckpointAssignment = new CheckpointAssignment(data);

  CheckpointAssignment.create(newAssignment)
    .then((assignment: ICheckpointAssignment) =>
      res
        .status(StatusCodes.CREATED)
        .set("Location", `/checkpoint-assignments/${assignment._id}`)
        .json(assignment)
    )
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

// PATCH /checkpoint-assignments/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const assignment: ICheckpointAssignment | null = await CheckpointAssignment.findById(
    requestedId
  );

  if (assignment) {
    assignment
      .set(req.body)
      .save()
      .then(() => res.status(StatusCodes.OK).json())
      .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
  }
};

// DELETE /checkpoint-assignments/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const assignment: ICheckpointAssignment | null = await CheckpointAssignment.findById(
    requestedId
  );

  if (assignment) {
    CheckpointAssignment.deleteOne(assignment)
      .then(() => res.status(StatusCodes.OK).json({}))
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
