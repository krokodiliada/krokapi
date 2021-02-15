import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";

import GenericController from "controller/Common";

import TagAssignment, { ITagAssignment } from "model/TagAssignment";
import Event, { IEvent } from "model/Event";
import Participant, { IParticipant } from "model/Participant";

const validateAssignmentExists: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedId = req.params.id;

  const assignment: ITagAssignment | null = await TagAssignment.findById(
    requestedId
  );

  if (!assignment) {
    return res.status(StatusCodes.NOT_FOUND).json({});
  }

  return next();
};

interface TagAssignmentData {
  event: string;
  participant: string;
}

const isAssignmentDataValid = async (
  data: TagAssignmentData
): Promise<boolean> => {
  if (!("event" in data) || !("participant" in data)) {
    return false;
  }

  const eventId: string = data.event;
  const participantId: string = data.participant;

  if (
    !GenericController.isValidObjectId(eventId) ||
    !GenericController.isValidObjectId(participantId)
  ) {
    return false;
  }

  const event: IEvent | null = await Event.findById(eventId);
  const participant: IParticipant | null = await Participant.findById(
    participantId
  );

  if (!event || !participant) {
    return false;
  }

  return true;
};

const getNextAvailableTag = async (eventId: string): Promise<number> => {
  const currentEventAssignments = await TagAssignment.find().where({
    event: eventId,
  });

  const currentEventTags: Array<number> = currentEventAssignments.map(
    (assignment) => assignment.tag
  );

  const maxTagNumber = 2 ** 15; // Half of the short, to fit on card
  const allAvailbleTags: Array<number> = Array.from(Array(maxTagNumber).keys());

  const availableTags = allAvailbleTags.filter(
    (tag) => !currentEventTags.includes(tag)
  );

  const tag: number | undefined = _.sample(availableTags);

  if (!tag) {
    return -1;
  }

  return tag;
};

const getByEventAndParticipant = async (
  event: IEvent,
  participant: IParticipant,
  res: Response
): Promise<void> => {
  const filter = {
    event: { $in: event._id },
    participant: { $in: participant._id },
  };

  const assignments: Array<ITagAssignment> = await TagAssignment.find(filter);
  res.status(StatusCodes.OK).json(assignments);
};

// GET /tag-assignments/
const getAll: RequestHandler = async (req: Request, res: Response) => {
  const eventId: string = req.query.event as string;
  const participantId: string = req.query.participant as string;

  if (
    (eventId && !GenericController.isValidObjectId(eventId)) ||
    (participantId && !GenericController.isValidObjectId(participantId)) ||
    (eventId && !participantId) ||
    (participantId && !eventId)
  ) {
    res.status(StatusCodes.BAD_REQUEST).json({});
    return;
  }

  const event: IEvent | null = await Event.findById(eventId);
  const participant: IParticipant | null = await Participant.findById(
    participantId
  );

  if ((eventId && !event) || (participantId && !participant)) {
    res.status(StatusCodes.NOT_FOUND).json({});
    return;
  }

  if (event && participant) {
    getByEventAndParticipant(event, participant, res);
    return;
  }

  const assignments: Array<ITagAssignment> = await TagAssignment.find();
  res.status(StatusCodes.OK).json(assignments);
};

// GET /tag-assignments/:id
const getById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const assignment: ITagAssignment | null = await TagAssignment.findById(
    requestedId
  );

  if (assignment) {
    res.status(StatusCodes.OK).json(assignment);
  }
};

// POST /tag-assignments/
const create: RequestHandler = async (req: Request, res: Response) => {
  const data = req.body;

  const isDataValid = await isAssignmentDataValid(data);
  if (!isDataValid) {
    res.status(StatusCodes.BAD_REQUEST).json({});
    return;
  }

  if (!("tag" in data)) {
    const tag = await getNextAvailableTag(data.event);

    if (tag === -1) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
      return;
    }

    data.tag = tag;
  }

  const newAssignment: ITagAssignment = new TagAssignment(data);

  TagAssignment.create(newAssignment)
    .then((assignment: ITagAssignment) =>
      res
        .status(StatusCodes.CREATED)
        .set("Location", `/tag-assignments/${assignment._id}`)
        .json(assignment)
    )
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

// PATCH /tag-assignments/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const assignment: ITagAssignment | null = await TagAssignment.findById(
    requestedId
  );

  if (!assignment) {
    return;
  }

  assignment.set(req.body);
  assignment
    .validate()
    .then(async () => {
      const updateData: TagAssignmentData = {
        event: assignment.event,
        participant: assignment.participant,
      };

      const isDataValid = await isAssignmentDataValid(updateData);

      if (isDataValid) {
        assignment
          .save()
          .then(() => res.status(StatusCodes.OK).json({}))
          .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({});
      }
    })
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

// DELETE /tag-assignments/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const assignment: ITagAssignment | null = await TagAssignment.findById(
    requestedId
  );

  if (assignment) {
    TagAssignment.deleteOne(assignment)
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
