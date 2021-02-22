import mongoose from "mongoose";
import faker from "faker";

import Category, { ICategory } from "model/Category";
import Checkpoint, { ICheckpoint } from "model/Checkpoint";
import CheckpointAssignment, {
  ICheckpointAssignment,
  CheckpointCostMetric,
} from "model/CheckpointAssignment";
import Event, { IEvent } from "model/Event";
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

const event: IEvent = new Event({
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
  event: event._id,
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
    await Event.deleteMany({});
    await Category.deleteMany({});
    await Station.deleteMany({});
    await CheckpointAssignment.deleteMany({});
  });

  it("Throws an error if assignment is created without parameters", async () => {
    const assignment: ICheckpointAssignment = new CheckpointAssignment();
    await expect(
      CheckpointAssignment.create(assignment)
    ).rejects.toThrowError();
  });

  it("Throws an error if assignment is created with only half required parameters", async () => {
    const assignment: ICheckpointAssignment = new CheckpointAssignment({
      event: event._id,
      category: category._id,
    });
    await expect(
      CheckpointAssignment.create(assignment)
    ).rejects.toThrowError();
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
      event: expect.any(Object),
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
