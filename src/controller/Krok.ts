import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import Krok, { IKrok } from "model/Krok";

// GET /kroks/
export const getAll: RequestHandler = async (_: Request, res: Response) => {
  const kroks: Array<IKrok> = await Krok.find();

  res.status(StatusCodes.OK).json(kroks);
};

// GET /kroks/:number
export const getByNumber: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const requestedKrokNumber = Number(req.params.number);

  if (Number.isNaN(requestedKrokNumber)) {
    res.status(StatusCodes.BAD_REQUEST).json({});
    return;
  }

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

export const create: RequestHandler = async (req: Request, res: Response) => {
  const requestedKrokNumber = Number(req.params.number);

  if (Number.isNaN(requestedKrokNumber)) {
    res.status(StatusCodes.BAD_REQUEST).json({});
    return;
  }

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

export const update: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Krok.create(req.body)
    .then((krok) => res.json(krok))
    .catch(next);
};

export const deleteByNumber: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Krok.find(req.body)
    .then((krok) => res.json(krok))
    .catch(next);
};

export default { getAll, getByNumber, create, update, deleteByNumber };
