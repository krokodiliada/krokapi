import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import Participant, { IParticipant } from "model/Participant";
import TagAssignment, { ITagAssignment } from "model/TagAssignment";
import Errors from "Errors";
import utils from "utils";

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
    return res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Participants.DOES_NOT_EXIST,
    });
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

interface GetByTagAndEventParameters {
  tag: number;
  event: string;
}

const getByTagAndEvent = async ({
  tag,
  event,
}: GetByTagAndEventParameters): Promise<IParticipant | null> => {
  const tagAssignments: Array<ITagAssignment> = await TagAssignment.find()
    .where({ tag })
    .where({ event });

  if (tagAssignments.length === 0) {
    return null;
  }

  const participant: IParticipant | null = await Participant.findById(
    tagAssignments[0].participant
  );

  return participant;
};

// PUT /participants/
const create: RequestHandler = async (req: Request, res: Response) => {
  const data = req.body;
  const version = utils.extractVersionFromUrl(req.originalUrl);

  const newParticipant: IParticipant = new Participant(data);

  Participant.create(newParticipant)
    .then((participant: IParticipant) =>
      res
        .status(StatusCodes.CREATED)
        .set("Location", `/${version}/participants/${participant._id}`)
        .json(participant)
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

// PATCH /participants/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedParticipantId = req.params.id;

  if (Object.keys(req.body).length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: Errors.EMPTY_REQUEST_BODY,
    });
    return;
  }

  const participant: IParticipant | null = await Participant.findById(
    requestedParticipantId
  );

  if (participant) {
    participant
      .set(req.body)
      .save()
      .then(() => res.status(StatusCodes.OK).json(participant))
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

// DELETE /participants/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedParticipantId = req.params.id;

  const participant: IParticipant | null = await Participant.findById(
    requestedParticipantId
  );

  if (participant) {
    Participant.deleteOne(participant)
      .then(() => res.status(StatusCodes.NO_CONTENT).send())
      .catch(() =>
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: Errors.INTERNAL_SERVER_ERROR,
        })
      );
  }
};

export default {
  validateParticipantExists,
  getAll,
  getById,
  getByTagAndEvent,
  create,
  update,
  deleteById,
};
