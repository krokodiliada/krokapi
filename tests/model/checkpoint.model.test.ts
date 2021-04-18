import mongoose from "mongoose";
import faker from "faker";

import Category, { ICategory } from "model/Category";
import Location, { ILocation } from "model/Location";
import Checkpoint, {
  ICheckpoint,
  CheckpointCostMetric,
} from "model/Checkpoint";
import Event, { IEvent } from "model/Event";
import Station, { IStation } from "model/Station";

const location: ILocation = new Location({
  name: "Test Checkpoint",
  latitude: 55.891833,
  longitude: 39.389303,
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

const validCheckpoint: ICheckpoint = new Checkpoint({
  event: event._id,
  category: category._id,
  location: location._id,
  station: station._id,
});

describe("Checkpoint model", () => {
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
    await Location.deleteMany({});
    await Event.deleteMany({});
    await Category.deleteMany({});
    await Station.deleteMany({});
    await Checkpoint.deleteMany({});
  });

  it("Throws an error if checkpoint is created without parameters", async () => {
    const checkpoint: ICheckpoint = new Checkpoint();
    await expect(Checkpoint.create(checkpoint)).rejects.toThrowError();
  });

  it("Throws an error if checkpoint is created with only half required parameters", async () => {
    const checkpoint: ICheckpoint = new Checkpoint({
      event: event._id,
      category: category._id,
    });
    await expect(Checkpoint.create(checkpoint)).rejects.toThrowError();
  });

  it("Should create a new checkpoint with name only", async () => {
    expect.assertions(7);

    const checkpoint: ICheckpoint = new Checkpoint(validCheckpoint);

    const spy = jest.spyOn(checkpoint, "save");
    const savedCheckpoint: ICheckpoint = await checkpoint.save();

    expect(spy).toHaveBeenCalled();

    expect(savedCheckpoint).toMatchObject({
      event: expect.any(Object),
      category: expect.any(Object),
      location: expect.any(Object),
      station: expect.any(Object),
      required: expect.any(Boolean),
      checkOrder: expect.any(Boolean),
      costMetric: expect.any(String),
    });

    expect(savedCheckpoint.required).toBe(true);
    expect(savedCheckpoint.checkOrder).toBe(true);
    expect(savedCheckpoint.order).toBe(undefined);
    expect(savedCheckpoint.cost).toBe(undefined);
    expect(savedCheckpoint.costMetric).toBe(CheckpointCostMetric.Seconds);
  });
});
