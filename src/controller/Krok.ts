import { Request, Response, NextFunction, RequestHandler } from "express";
import Krok, { IKrok } from "model/Krok";

const create: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Krok.create(req.body)
    .then((krok) => res.json(krok))
    .catch(next);
};

// GET /kroks/:number
const getByNumber: RequestHandler = async (req: Request, res: Response) => {
  console.log("Trying to get the krok by number!");

  const query = {
    number: Number(req.params.number),
  };

  const krok: IKrok | null = await Krok.findOne(query);

  if (krok) {
    res.status(200).json(krok);
  } else {
    res.status(404).json({});
  }
};

const deleteByNumber: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Krok.find(req.body)
    .then((krok) => res.json(krok))
    .catch(next);
};

export { create, getByNumber, deleteByNumber };
