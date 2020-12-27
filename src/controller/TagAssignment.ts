import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";

import GenericController from "controller/Common";

import TagAssignment, { ITagAssignment } from "model/TagAssignment";
import Krok, { IKrok } from "model/Krok";
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
  krok: string;
  participant: string;
}

const isAssignmentDataValid = async (
  data: TagAssignmentData
): Promise<boolean> => {
  if (!("krok" in data) || !("participant" in data)) {
    return false;
  }

  const krokId: string = data.krok;
  const participantId: string = data.participant;

  if (
    !GenericController.isValidObjectId(krokId) ||
    !GenericController.isValidObjectId(participantId)
  ) {
    return false;
  }

  const krok: IKrok | null = await Krok.findById(krokId);
  const participant: IParticipant | null = await Participant.findById(
    participantId
  );

  if (!krok || !participant) {
    return false;
  }

  return true;
};

const getNextAvailableTag = async (krokId: string): Promise<number> => {
  const currentKrokAssignments = await TagAssignment.find().where({
    krok: krokId,
  });

  const currentKrokTags: Array<number> = currentKrokAssignments.map(
    (assignment) => assignment.tag
  );

  const maxTagNumber = 2 ** 15; // Half of the short, to fit on card
  const allAvailbleTags: Array<number> = Array.from(Array(maxTagNumber).keys());

  const availableTags = allAvailbleTags.filter(
    (tag) => !currentKrokTags.includes(tag)
  );

  const tag: number | undefined = _.sample(availableTags);

  if (!tag) {
    return -1;
  }

  return tag;
};

const getByKrokAndParticipant = async (
  krok: IKrok,
  participant: IParticipant,
  res: Response
): Promise<void> => {
  const filter = {
    krok: { $in: krok._id },
    participant: { $in: participant._id },
  };

  const assignments: Array<ITagAssignment> = await TagAssignment.find(filter);
  res.status(StatusCodes.OK).json(assignments);
};

// GET /tag-assignments/
const getAll: RequestHandler = async (req: Request, res: Response) => {
  const krokId: string = req.query.krok as string;
  const participantId: string = req.query.participant as string;

  if (
    (krokId && !GenericController.isValidObjectId(krokId)) ||
    (participantId && !GenericController.isValidObjectId(participantId)) ||
    (krokId && !participantId) ||
    (participantId && !krokId)
  ) {
    res.status(StatusCodes.BAD_REQUEST).json({});
    return;
  }

  const krok: IKrok | null = await Krok.findById(krokId);
  const participant: IParticipant | null = await Participant.findById(
    participantId
  );

  if ((krokId && !krok) || (participantId && !participant)) {
    res.status(StatusCodes.NOT_FOUND).json({});
    return;
  }

  if (krok && participant) {
    getByKrokAndParticipant(krok, participant, res);
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
    const tag = await getNextAvailableTag(data.krok);

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
        krok: assignment.krok,
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
