import mongoose from "mongoose";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import Category, { ICategory } from "model/Category";
import Krok, { IKrok } from "model/Krok";
import GpsLocation, { IGpsLocation } from "model/GpsLocation";

/**
 * Validate krok :number parameter
 */
const krokIdExists = async (id: string): Promise<boolean> => {
  const krok: IKrok | null = await Krok.findById(id);

  if (!krok) {
    return false;
  }

  return true;
};

const validateKrokExists: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedKrokNumber = Number(req.params.number);

  const krok: IKrok | null = await Krok.findOne({
    number: requestedKrokNumber,
  });

  // If inserting inexisting krok, then PUT should be allowed.
  // For PUT methods, also check the number of parameters in the request.
  // Number > 1 means that the route is nested, e.g.
  // /kroks/:number/categories/:categoryId
  if (!krok && req.method !== "PUT") {
    return res.status(StatusCodes.NOT_FOUND).json({});
  }

  return next();
};

/**
 * Validate krok category :categoryId parameter
 */
const validateCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedKrokNumber = Number(req.params.number);
  const requestedCategoryId = req.params.categoryId;

  const { ObjectId } = mongoose.Types;
  if (!ObjectId.isValid(requestedCategoryId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({});
  }

  const krok: IKrok | null = await Krok.findOne({
    number: requestedKrokNumber,
  });

  if (req.method !== "PUT" && !krok?.categories.includes(requestedCategoryId)) {
    return res.status(StatusCodes.NOT_FOUND).json({});
  }

  if (req.method === "PUT" || req.method === "POST") {
    const category: ICategory | null = await Category.findById(
      requestedCategoryId
    );

    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).json({});
    }
  }

  return next();
};

/**
 * Validate krok location :locationId parameter
 * locationId is only specified for PUT method
 */
const validateLocation: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedLocationId = req.params.locationId;

  const { ObjectId } = mongoose.Types;
  if (!ObjectId.isValid(requestedLocationId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({});
  }

  const location: IGpsLocation | null = await GpsLocation.findById(
    requestedLocationId
  );

  if (!location) {
    return res.status(StatusCodes.NOT_FOUND).json({});
  }

  return next();
};

// GET /kroks/
const getAll: RequestHandler = async (_: Request, res: Response) => {
  const kroks: Array<IKrok> = await Krok.find();

  res.status(StatusCodes.OK).json(kroks);
};

// GET /kroks/:number
const getByNumber: RequestHandler = async (req: Request, res: Response) => {
  const requestedKrokNumber = Number(req.params.number);

  const query = {
    number: requestedKrokNumber,
  };

  const krok: IKrok | null = await Krok.findOne(query);

  if (krok) {
    res.status(StatusCodes.OK).json(krok);
  }
};

// PUT /kroks/:number
const create: RequestHandler = async (req: Request, res: Response) => {
  const requestedKrokNumber = Number(req.params.number);

  const query = req.body;
  query.number = requestedKrokNumber;

  const krok: IKrok | null = await Krok.findOne({
    number: requestedKrokNumber,
  });

  const newKrok: IKrok = new Krok(query);

  if (krok) {
    newKrok._id = krok._id;

    krok
      .set(newKrok)
      .save()
      .then((modifiedKrok: IKrok) =>
        res.status(StatusCodes.OK).json(modifiedKrok)
      )
      .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
  } else {
    Krok.create(newKrok)
      .then((insertedKrok: IKrok) =>
        res.status(StatusCodes.CREATED).json(insertedKrok)
      )
      .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
  }
};

// PATCH /kroks/:number
const update: RequestHandler = async (req: Request, res: Response) => {
  const requestedKrokNumber = Number(req.params.number);

  if (Object.keys(req.body).length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({});
    return;
  }

  const query = {
    number: requestedKrokNumber,
  };

  const krok: IKrok | null = await Krok.findOne(query);

  if (krok) {
    krok
      .set(req.body)
      .save()
      .then(() => res.status(StatusCodes.OK).json())
      .catch(() => res.status(StatusCodes.BAD_REQUEST).json({}));
  }
};

// DELETE /kroks/:number
const deleteByNumber: RequestHandler = async (req: Request, res: Response) => {
  const requestedKrokNumber = Number(req.params.number);

  const krok: IKrok | null = await Krok.findOne({
    number: requestedKrokNumber,
  });

  if (krok) {
    Krok.deleteOne(krok)
      .then(() => res.status(StatusCodes.OK).json({}))
      .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({}));
  }
};

// GET /kroks/:number/categories
const getAllCategories: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestedKrokNumber = Number(req.params.number);

  const krok: IKrok | null = await Krok.findOne({
    number: requestedKrokNumber,
  });

  if (krok) {
    res.status(StatusCodes.OK).json({
      categories: krok.categories,
    });
  }
};

// DELETE /kroks/:number/categories/:categoryId
const deleteCategory: RequestHandler = async (req: Request, res: Response) => {
  const requestedKrokNumber = Number(req.params.number);
  const requestedCategoryId: string = req.params.categoryId;

  const krok: IKrok | null = await Krok.findOne({
    number: requestedKrokNumber,
  });

  if (krok) {
    const categoryIndex = krok.categories.indexOf(requestedCategoryId, 0);
    if (categoryIndex > -1) {
      krok.categories.splice(categoryIndex, 1);
    }

    krok
      .save()
      .then(() => {
        res.status(StatusCodes.OK).json({});
      })
      .catch(() => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
      });
  }
};

// PUT /kroks/:number/categories/:categoryId
const addCategory: RequestHandler = async (req: Request, res: Response) => {
  const requestedKrokNumber = Number(req.params.number);
  const requestedCategoryId: string = req.params.categoryId;

  const krok: IKrok | null = await Krok.findOne({
    number: requestedKrokNumber,
  });

  if (!krok) {
    res.status(StatusCodes.NOT_FOUND).json({});
    return;
  }

  if (!krok.categories.includes(requestedCategoryId)) {
    krok.categories.push(requestedCategoryId);
  }

  krok
    .save()
    .then(() => {
      res.status(StatusCodes.OK).json({});
    })
    .catch(() => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
    });
};

// GET /kroks/:number/location
const getLocation: RequestHandler = async (req: Request, res: Response) => {
  const requestedKrokNumber = Number(req.params.number);

  const krok: IKrok | null = await Krok.findOne({
    number: requestedKrokNumber,
  });

  if (!krok) {
    return;
  }

  if (krok.location) {
    const location: IGpsLocation | null = await GpsLocation.findById(
      krok.location._id
    );

    if (location) {
      res.status(StatusCodes.OK).json(location);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
    }
  } else {
    res.status(StatusCodes.NOT_FOUND).json({});
  }
};

// DELETE /kroks/:number/location
const deleteLocation: RequestHandler = async (req: Request, res: Response) => {
  const requestedKrokNumber = Number(req.params.number);

  const krok: IKrok | null = await Krok.findOne({
    number: requestedKrokNumber,
  });

  if (!krok) {
    return;
  }

  if (!krok.location) {
    res.status(StatusCodes.NOT_FOUND).json({});
    return;
  }

  delete krok.location;

  krok
    .save()
    .then(() => {
      res.status(StatusCodes.OK).json({});
    })
    .catch(() => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
    });
};

// PUT /kroks/:number/location/:locationId
const addLocation: RequestHandler = async (req: Request, res: Response) => {
  const requestedKrokNumber = Number(req.params.number);
  const requestedLocationId = req.params.locationId;

  const krok: IKrok | null = await Krok.findOne({
    number: requestedKrokNumber,
  });

  if (!krok) {
    return;
  }

  krok.location = requestedLocationId;

  krok
    .save()
    .then(() => {
      res.status(StatusCodes.OK).json({});
    })
    .catch(() => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({});
    });
};

export default {
  krokIdExists,
  validateKrokExists,
  validateCategory,
  validateLocation,
  getAll,
  getByNumber,
  create,
  update,
  deleteByNumber,
  getAllCategories,
  deleteCategory,
  addCategory,
  getLocation,
  deleteLocation,
  addLocation,
};
