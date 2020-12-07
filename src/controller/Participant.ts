import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import Participant, { IParticipant } from "model/Participant";

const validateParticipantExists: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedParticipantId = req.params.id;

  const participant: IParticipant | null = await Participant.findById(
    requestedParticipantId
  );

  if (!participant) {
    return res.status(StatusCodes.NOT_FOUND).json({});
  }

  return next();
};

// GET /participants/
const getAll: RequestHandler = async (_: Request, res: Response) => {
  const participants: Array<IParticipant> = await Participant.find();
  res.status(StatusCodes.OK).json(participants);
};

// GET /participants/:id
const getById: RequestHandler = async (req: Request, res: Response) => {
  const requestedParticipantId = req.params.id;

  const participant: IParticipant | null = await Participant.findById(
    requestedParticipantId
  );

  if (participant) {
    res.status(StatusCodes.OK).json(participant);
  }
};

// PUT /participants/
const create: RequestHandler = async (req: Request, res: Response) => {
  const data = req.body;

  const newParticipant: IParticipant = new Participant(data);

  Participant.create(newParticipant)
    .then((participant: IParticipant) =>
      res
        .status(StatusCodes.CREATED)
        .set("Location", `/participants/${participant._id}`)
        .json(participant)
    )
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

// PATCH /participants/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedParticipantId = req.params.id;

  const participant: IParticipant | null = await Participant.findById(
    requestedParticipantId
  );

  if (participant) {
    participant
      .set(req.body)
      .save()
      .then(() => res.status(StatusCodes.OK).json())
      .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
  }
};

// DELETE /participants/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedParticipantId = req.params.id;

  const participant: IParticipant | null = await Participant.findById(
    requestedParticipantId
  );

  if (participant) {
    Participant.deleteOne(participant)
      .then(() => res.status(StatusCodes.OK).json({}))
      .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({}));
  }
};

export default {
  validateParticipantExists,
  getAll,
  getById,
  create,
  update,
  deleteById,
};