import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";

import GenericController from "controller/Common";
import TagAssignment, { ITagAssignment } from "model/TagAssignment";
import Event, { IEvent } from "model/Event";
import Participant, { IParticipant } from "model/Participant";
import Errors from "Errors";
import utils from "utils";

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
    return res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.TagAssignments.DOES_NOT_EXIST,
    });
  }

  return next();
};

interface TagAssignmentData {
  res: Response;
  eventId: string;
  participantId: string;
}

const isAssignmentDataValid = async ({
  res,
  eventId,
  participantId,
}: TagAssignmentData): Promise<boolean> => {
  if (eventId && !GenericController.isValidObjectId(eventId)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: `'${eventId}' is not a valid event id`,
    });
    return false;
  }

  if (participantId && !GenericController.isValidObjectId(participantId)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: `'${participantId}' is not a valid participant id`,
    });
    return false;
  }

  if ((eventId && !participantId) || (participantId && !eventId)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: Errors.TagAssignments.EVENT_AND_PARTICIPANT_REQUIRED,
    });
    return false;
  }

  const event: IEvent | null = await Event.findById(eventId);

  if (eventId && !event) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: Errors.Events.DOES_NOT_EXIST,
    });
    return false;
  }

  const participant: IParticipant | null = await Participant.findById(
    participantId
  );

  if (participantId && !participant) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: Errors.Participants.DOES_NOT_EXIST,
    });
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

  if (await isAssignmentDataValid({ res, eventId, participantId })) {
    const event: IEvent | null = await Event.findById(eventId);
    const participant: IParticipant | null = await Participant.findById(
      participantId
    );

    if (event && participant) {
      getByEventAndParticipant(event, participant, res);
      return;
    }
  } else if (eventId || participantId) {
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
  const version = utils.extractVersionFromUrl(req.originalUrl);

  const isDataValid = await isAssignmentDataValid({
    res,
    eventId: data.event,
    participantId: data.participant,
  });

  if (!isDataValid) {
    return;
  }

  if (!data.tag) {
    const tag = await getNextAvailableTag(data.event);

    if (tag === -1) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: Errors.TagAssignments.CANNOT_GENERATE_TAG_NUMBER,
      });
      return;
    }

    data.tag = tag;
  }

  const newAssignment: ITagAssignment = new TagAssignment(data);

  TagAssignment.create(newAssignment)
    .then((assignment: ITagAssignment) =>
      res
        .status(StatusCodes.CREATED)
        .set("Location", `/${version}/tag-assignments/${assignment._id}`)
        .json(assignment)
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

// PATCH /tag-assignments/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  if (Object.keys(req.body).length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: Errors.EMPTY_REQUEST_BODY,
    });
    return;
  }

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
        res,
        eventId: assignment.event,
        participantId: assignment.participant,
      };

      const isDataValid = await isAssignmentDataValid(updateData);

      if (isDataValid) {
        assignment
          .save()
          .then(() => res.status(StatusCodes.OK).json(assignment))
          .catch((error) => {
            if (error.message) {
              res
                .status(StatusCodes.BAD_REQUEST)
                .json({ error: error.message });
            } else {
              res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: Errors.INTERNAL_SERVER_ERROR,
              });
            }
          });
      }
    })
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

// DELETE /tag-assignments/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedId = req.params.id;

  const assignment: ITagAssignment | null = await TagAssignment.findById(
    requestedId
  );

  if (assignment) {
    TagAssignment.deleteOne(assignment)
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
