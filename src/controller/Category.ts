import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import GenericController from "controller/Common";

import Category, { ICategory } from "model/Category";
import Event, { IEvent } from "model/Event";
import Team, { ITeam } from "model/Team";
import Checkpoint, { ICheckpoint } from "model/Checkpoint";
import Route, { IRoute } from "model/Route";
import TagAssignment, { ITagAssignment } from "model/TagAssignment";
import Errors from "Errors";
import utils from "utils";

const validateCategoryExists: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedCategoryId = req.params.id;

  const category: ICategory | null = await Category.findById(
    requestedCategoryId
  );

  if (!category) {
    return res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Categories.DOES_NOT_EXIST,
    });
  }

  return next();
};

/**
 * Check if at least one team is assigned to the category
 * @param categoryId Category ObjectId
 */
const isTeamRegisteredInCategory = async (
  categoryId: string
): Promise<boolean> => {
  const teams: Array<ITeam> = await Team.find({
    category: categoryId,
  });

  if (teams.length > 0) {
    return true;
  }

  return false;
};

/**
 * Check if at least one checkpoint assigned to the category
 * @param categoryId Category ObjectId
 */
const isCheckpointAssignedToCategory = async (
  categoryId: string
): Promise<boolean> => {
  const checkpoints: Array<ICheckpoint> = await Checkpoint.find({
    category: categoryId,
  });

  if (checkpoints.length > 0) {
    return true;
  }

  return false;
};

const unassignCategoryFromEvent = async (categoryId: string) => {
  // Get the list of all events
  const events: Array<IEvent> = await Event.find();

  events.forEach((event) => {
    const { categories } = event;

    const categoryIndex = categories.indexOf(categoryId, 0);
    if (categoryIndex > -1) {
      categories.splice(categoryIndex, 1);
    }

    event.save();
  });
};

const categoryHasRoutes = async (category: ICategory): Promise<boolean> => {
  // Get all routes
  const routes: Array<IRoute> = await Route.find();
  const assignmentIds: Array<string> = routes.map(
    (route) => route.tagAssignment
  );

  // Get all tag assignments that have routes.
  const tagAssignments: Array<ITagAssignment> = await TagAssignment.find().where(
    {
      _id: { $in: assignmentIds },
    }
  );

  // Get ids of people for these tag assignments
  const routeParticipantIds: Array<string> = tagAssignments.map(
    (assignment) => assignment.participant
  );

  // Get teams that contain these participants
  const teams: Array<ITeam> = await Team.find().where({
    participants: { $in: routeParticipantIds },
  });

  // Check if at least one team is registered in that category
  return teams.some((team) => String(team.category) === String(category._id));
};

const canSetParticipantsNumber = async (
  category: ICategory
): Promise<boolean> => {
  // Check that the min/max participants number corresponts to the number
  // of participants for each team in that category
  const teams: Array<ITeam> = await Team.find().where({
    category: category._id,
  });

  // Check if at least one team will be affected by the new parameters
  const foundAffectedTeam: boolean = teams.some((team) => {
    if (
      team.participants.length < category.participantsNumber.min ||
      team.participants.length > category.participantsNumber.max
    ) {
      return true;
    }

    return false;
  });

  return !foundAffectedTeam;
};

const canSetCategoryParameters = async (
  currentCategory: ICategory,
  newCategory: ICategory
): Promise<[boolean, string]> => {
  const minNumberChanged =
    newCategory.participantsNumber.min !==
    currentCategory.participantsNumber.min;
  const maxNumberChanged =
    newCategory.participantsNumber.max !==
    currentCategory.participantsNumber.max;

  if (minNumberChanged || maxNumberChanged) {
    const canSave: boolean = await canSetParticipantsNumber(newCategory);
    if (!canSave) {
      return [false, Errors.Categories.CANT_CHANGE_PARTICIPANTS_NUMBER];
    }
  }

  if (
    newCategory.minCheckpoints !== currentCategory.minCheckpoints ||
    newCategory.maxTime !== currentCategory.maxTime
  ) {
    const hasRoutes: boolean = await categoryHasRoutes(newCategory);
    if (hasRoutes) {
      return [false, Errors.Categories.CANT_CHANGE_TIME_OR_CHECKPOINTS];
    }
  }

  return [true, ""];
};

// GET /categories/
const getAll: RequestHandler = async (req: Request, res: Response) => {
  const eventId: string = req.query.event as string;

  if (eventId && !GenericController.isValidObjectId(eventId)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: `'${eventId}' is not a valid object id`,
    });
    return;
  }

  const event: IEvent | null = await Event.findById(eventId);

  if (eventId && !event) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Events.DOES_NOT_EXIST,
    });
    return;
  }

  let filter = {};

  if (event) {
    filter = {
      _id: { $in: event.categories },
    };
  }

  const categories: Array<ICategory> = await Category.find(filter);
  res.status(StatusCodes.OK).json(categories);
};

// GET /categories/:id
const getById: RequestHandler = async (req: Request, res: Response) => {
  const requestedCategoryId = req.params.id;

  const category: ICategory | null = await Category.findById(
    requestedCategoryId
  );

  if (category) {
    res.status(StatusCodes.OK).json(category);
  }
};

// POST /categories/
const create: RequestHandler = async (req: Request, res: Response) => {
  const data = req.body;
  const version = utils.extractVersionFromUrl(req.originalUrl);

  const newCategory: ICategory = new Category(data);

  Category.create(newCategory)
    .then((category: ICategory) =>
      res
        .status(StatusCodes.CREATED)
        .set("Location", `/${version}/categories/${category._id}`)
        .json(category)
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

// PATCH /categories/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedCategoryId = req.params.id;

  if (Object.keys(req.body).length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: Errors.EMPTY_REQUEST_BODY,
    });
    return;
  }

  const category: ICategory | null = await Category.findById(
    requestedCategoryId
  );

  if (!category) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Categories.DOES_NOT_EXIST,
    });
    return;
  }

  const originalCategory: ICategory = new Category(category);

  category
    .set(req.body)
    .validate()
    .then(async () => {
      const [canSetParameters, setParametersError]: [
        boolean,
        string
      ] = await canSetCategoryParameters(originalCategory, category);

      if (canSetParameters) {
        category
          .save()
          .then(() => res.status(StatusCodes.OK).json(category))
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
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({ error: setParametersError });
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

// DELETE /categories/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedCategoryId = req.params.id;

  const category: ICategory | null = await Category.findById(
    requestedCategoryId
  );

  if (!category) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: Errors.Categories.DOES_NOT_EXIST,
    });
    return;
  }

  const teamRegistered: boolean = await isTeamRegisteredInCategory(
    requestedCategoryId
  );
  const checkpointAssigned: boolean = await isCheckpointAssignedToCategory(
    requestedCategoryId
  );

  if (teamRegistered || checkpointAssigned) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: Errors.Categories.CATEGORY_IN_USE,
    });
    return;
  }

  Category.deleteOne(category)
    .then(() => {
      unassignCategoryFromEvent(requestedCategoryId);
      res.status(StatusCodes.NO_CONTENT).send();
    })
    .catch(() =>
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: Errors.INTERNAL_SERVER_ERROR,
      })
    );
};

export default {
  validateCategoryExists,
  getAll,
  getById,
  create,
  update,
  deleteById,
};
