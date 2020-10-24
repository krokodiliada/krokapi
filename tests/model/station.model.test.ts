import mongoose from "mongoose";
import Station, { IStation, StationType } from "model/Station";

const validStation: IStation = new Station({
  number: 333,
});

describe("Station model", () => {
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
    await Station.deleteMany({});
  });

  it("Throws an error if station is created without parameters", () => {
    const station: IStation = new Station();
    expect(station.validate).toThrow();
  });

  it("Should create a new station with station number", async () => {
    expect.assertions(5);

    const station: IStation = new Station(validStation);

    const spy = jest.spyOn(station, "save");

    const savedStation: IStation = await station.save();

    expect(spy).toHaveBeenCalled();

    expect(savedStation).toMatchObject({
      number: expect.any(Number),
      enabled: expect.any(Boolean),
      stationType: expect.any(String),
    });

    expect(savedStation.number).toBe(333);
    expect(savedStation.enabled).toBe(true);
    expect(savedStation.stationType).toBe(StationType.Regular);
  });
});
