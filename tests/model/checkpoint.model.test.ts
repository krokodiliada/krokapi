import mongoose from "mongoose";
import Checkpoint, { ICheckpoint } from "model/Checkpoint";

const validCheckpoint: ICheckpoint = new Checkpoint({
  name: "Test Checkpoint",
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
    await Checkpoint.deleteMany({});
  });

  it("Throws an error if checkpoint is created without parameters", () => {
    const checkpoint: ICheckpoint = new Checkpoint();
    expect(checkpoint.validate).toThrow();
  });

  it("Should create a new checkpoint with name only", async () => {
    expect.assertions(6);

    const checkpoint: ICheckpoint = new Checkpoint(validCheckpoint);
    const spy = jest.spyOn(checkpoint, "save");
    const savedCheckpoint: ICheckpoint = await checkpoint.save();

    expect(spy).toHaveBeenCalled();

    expect(savedCheckpoint).toMatchObject({
      name: expect.any(String),
      water: expect.any(Boolean),
    });

    expect(savedCheckpoint.location).toBeUndefined();
    expect(savedCheckpoint.description).toBeUndefined();
    expect(savedCheckpoint.water).toBe(false);
    expect(savedCheckpoint.note).toBeUndefined();
  });
});
