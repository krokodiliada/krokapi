import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import Krok, { IKrok } from "model/Krok";

// Validate krok :number parameter
const validateKrokNumber: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedKrokNumber = Number(req.params.number);

  if (Number.isNaN(requestedKrokNumber)) {
    return res.status(StatusCodes.BAD_REQUEST).json({});
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
  } else {
    res.status(StatusCodes.NOT_FOUND).json({});
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
  } else {
    res.status(StatusCodes.NOT_FOUND).json({});
  }
};

// DELETE /kroks/:number
const deleteByNumber: RequestHandler = async (req: Request, res: Response) => {
  const requestedKrokNumber = Number(req.params.number);

  const krok: IKrok | null = await Krok.findOne({
    number: requestedKrokNumber,
  });

  if (!krok) {
    res.status(StatusCodes.NOT_FOUND).json({});
    return;
  }

  Krok.deleteOne(krok)
    .then(() => res.status(StatusCodes.OK).json(krok))
    .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({}));
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
  } else {
    res.status(StatusCodes.NOT_FOUND).json({});
  }
};

export default {
  getAll,
  getByNumber,
  create,
  update,
  deleteByNumber,
  getAllCategories,
  validateKrokNumber,
};
