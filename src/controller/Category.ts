import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import GenericController from "controller/Common";
import ParticipantController from "controller/Participant";
import TeamController from "controller/Team";

import Category, { ICategory } from "model/Category";
import Krok, { IKrok } from "model/Krok";
import Team, { ITeam } from "model/Team";
import CheckpointAssignment, {
  ICheckpointAssignment,
} from "model/CheckpointAssignment";
import Route, { IRoute } from "model/Route";
import { IParticipant } from "model/Participant";

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
    return res.status(StatusCodes.NOT_FOUND).json({});
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
  const checkpoints: Array<ICheckpointAssignment> = await CheckpointAssignment.find(
    {
      category: categoryId,
    }
  );

  if (checkpoints.length > 0) {
    return true;
  }

  return false;
};

const unassignCategoryFromKrok = async (categoryId: string) => {
  // Get the list of all krok events
  const kroks: Array<IKrok> = await Krok.find();

  kroks.forEach((krok) => {
    const { categories } = krok;

    const categoryIndex = categories.indexOf(categoryId, 0);
    if (categoryIndex > -1) {
      categories.splice(categoryIndex, 1);
    }

    krok.save();
  });
};

const categoryHasRoutes = async (category: ICategory): Promise<boolean> => {
  // First, we get the IDs of kroks that have this category
  const kroks: Array<IKrok> = await Krok.find().where({
    categories: category._id,
  });

  const krokIds: Array<string> = [];
  kroks.forEach((krok) => {
    krokIds.push(krok._id);
  });

  // We get all routes for such kroks
  const routes: Array<IRoute> = await Route.find().where({
    krok: { $in: krokIds },
  });

  // Lastly, we check if any of the routes relates to this category
  return routes.some(async (route) => {
    const tagNumber: number = route.tag;
    const participant: IParticipant | null = await ParticipantController.getByTagAndKrok(
      { tag: tagNumber, krok: route.krok }
    );

    if (participant) {
      const team: ITeam | null = await TeamController.getByParticipantAndKrok({
        participant: participant._id,
        krok: route.krok,
      });

      if (team && team.category === category._id) {
        return true;
      }
    }

    return false;
  });
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
): Promise<boolean> => {
  const minNumberChanged =
    newCategory.participantsNumber.min !==
    currentCategory.participantsNumber.min;
  const maxNumberChanged =
    newCategory.participantsNumber.max !==
    currentCategory.participantsNumber.max;

  if (minNumberChanged || maxNumberChanged) {
    const canSave: boolean = await canSetParticipantsNumber(newCategory);
    if (!canSave) {
      return false;
    }
  }

  if (
    newCategory.minCheckpoints !== currentCategory.minCheckpoints ||
    newCategory.maxTime !== currentCategory.maxTime
  ) {
    const hasRoutes: boolean = await categoryHasRoutes(newCategory);
    if (hasRoutes) {
      return false;
    }
  }

  return true;
};

// GET /categories/
const getAll: RequestHandler = async (req: Request, res: Response) => {
  const krokId: string = req.query.krok as string;

  if (krokId && !GenericController.isValidObjectId(krokId)) {
    res.status(StatusCodes.BAD_REQUEST).json({});
    return;
  }

  const krok: IKrok | null = await Krok.findById(krokId);

  if (krokId && !krok) {
    res.status(StatusCodes.NOT_FOUND).json({});
    return;
  }

  let filter = {};

  if (krok) {
    filter = {
      _id: { $in: krok.categories },
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

  const newCategory: ICategory = new Category(data);

  Category.create(newCategory)
    .then((category: ICategory) =>
      res
        .status(StatusCodes.CREATED)
        .set("Location", `/categories/${category._id}`)
        .json(category)
    )
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

// PATCH /categories/:id
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedCategoryId = req.params.id;

  const category: ICategory | null = await Category.findById(
    requestedCategoryId
  );

  if (!category) {
    res.status(StatusCodes.BAD_REQUEST).json({});
    return;
  }

  const originalCategory: ICategory = new Category(category);

  category
    .set(req.body)
    .validate()
    .then(async () => {
      const canSetParameters: boolean = await canSetCategoryParameters(
        originalCategory,
        category
      );

      if (canSetParameters) {
        category
          .save()
          .then(() => res.status(StatusCodes.OK).json({}))
          .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
      } else {
        res.status(StatusCodes.BAD_REQUEST).json({});
      }
    })
    .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
};

// DELETE /categories/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedCategoryId = req.params.id;

  const category: ICategory | null = await Category.findById(
    requestedCategoryId
  );

  if (!category) {
    res.status(StatusCodes.BAD_REQUEST).json({});
    return;
  }

  const teamRegistered: boolean = await isTeamRegisteredInCategory(
    requestedCategoryId
  );
  const checkpointAssigned: boolean = await isCheckpointAssignedToCategory(
    requestedCategoryId
  );

  if (teamRegistered || checkpointAssigned) {
    res.status(StatusCodes.BAD_REQUEST).json({});
    return;
  }

  Category.deleteOne(category)
    .then(() => {
      unassignCategoryFromKrok(requestedCategoryId);
      res.status(StatusCodes.OK).json({});
    })
    .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({}));
};

export default {
  validateCategoryExists,
  getAll,
  getById,
  create,
  update,
  deleteById,
};
