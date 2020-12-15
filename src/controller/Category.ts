import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import GenericController from "controller/Common";
import Category, { ICategory } from "model/Category";
import Krok, { IKrok } from "model/Krok";

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

  console.log(data);

  const newCategory: ICategory = new Category(data);

  console.log(newCategory);

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

  if (category) {
    category
      .set(req.body)
      .save()
      .then(() => res.status(StatusCodes.OK).json())
      .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
  }
};

// DELETE /participants/:id
const deleteById: RequestHandler = async (req: Request, res: Response) => {
  const requestedCategoryId = req.params.id;

  const category: ICategory | null = await Category.findById(
    requestedCategoryId
  );

  if (category) {
    Category.deleteOne(category)
      .then(() => res.status(StatusCodes.OK).json({}))
      .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({}));
  }
};

export default {
  validateCategoryExists,
  getAll,
  getById,
  create,
  update,
  deleteById,
};
