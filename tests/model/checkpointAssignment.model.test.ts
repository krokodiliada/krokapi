import mongoose from "mongoose";
import faker from "faker";

import Category, { ICategory } from "model/Category";
import Checkpoint, { ICheckpoint } from "model/Checkpoint";
import CheckpointAssignment, {
  ICheckpointAssignment,
  CheckpointCostMetric,
} from "model/CheckpointAssignment";
import Krok, { IKrok } from "model/Krok";
import Station, { IStation } from "model/Station";

const checkpoint: ICheckpoint = new Checkpoint({
  name: "Test Checkpoint",
});

const category: ICategory = new Category({
  name: {
    short: faker.name.firstName(),
    long: faker.name.lastName(),
  },
});

const krok: IKrok = new Krok({
  number: 50,
  date: {
    start: new Date("Sep 25, 2020"),
    end: new Date("Sep 27, 2020"),
  },
});

const station: IStation = new Station({
  number: 444,
});

const validAssignment: ICheckpointAssignment = new CheckpointAssignment({
  krok: krok._id,
  category: category._id,
  checkpoint: checkpoint._id,
  station: station._id,
});

describe("CheckpointAssignment model", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL ?? "", {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    mongoose.connection.close();
  });

  afterEach(async () => {
    await Checkpoint.deleteMany({});
    await Krok.deleteMany({});
    await Category.deleteMany({});
    await Station.deleteMany({});
    await CheckpointAssignment.deleteMany({});
  });

  it("Throws an error if assignment is created without parameters", () => {
    const assignment: ICheckpointAssignment = new CheckpointAssignment();
    expect(assignment.validate).toThrow();
  });

  it("Throws an error if assignment is created with only half required parameters", () => {
    const assignment: ICheckpointAssignment = new CheckpointAssignment({
      krok: krok._id,
      category: category._id,
    });
    expect(assignment.validate).toThrow();
  });

  it("Should create a new checkpoint with name only", async () => {
    expect.assertions(7);

    const assignment: ICheckpointAssignment = new CheckpointAssignment(
      validAssignment
    );

    const spy = jest.spyOn(assignment, "save");

    const savedAssignment: ICheckpointAssignment = await assignment.save();

    expect(spy).toHaveBeenCalled();

    expect(savedAssignment).toMatchObject({
      krok: expect.any(Object),
      category: expect.any(Object),
      checkpoint: expect.any(Object),
      station: expect.any(Object),
      required: expect.any(Boolean),
      checkOrder: expect.any(Boolean),
      costMetric: expect.any(String),
    });

    expect(savedAssignment.required).toBe(true);
    expect(savedAssignment.checkOrder).toBe(true);
    expect(savedAssignment.order).toBe(undefined);
    expect(savedAssignment.cost).toBe(undefined);
    expect(savedAssignment.costMetric).toBe(CheckpointCostMetric.Seconds);
  });
});
