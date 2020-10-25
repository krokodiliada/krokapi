import mongoose from "mongoose";
import GpsLocation, { IGpsLocation } from "model/GpsLocation";

const validLocation: IGpsLocation = new GpsLocation({
  name: "Test Location",
  latitude: 45.509416,
  longitude: -75.8100346,
});

describe("GpsLocation model", () => {
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
    await GpsLocation.deleteMany({});
  });

  it("Throws an error if location is created without parameters", () => {
    const location: IGpsLocation = new GpsLocation();
    expect(location.validate).toThrow();
  });

  it("Throws an error if location is created with name only", () => {
    const location: IGpsLocation = new GpsLocation({
      name: "Test Location",
    });
    expect(location.validate).toThrow();
  });

  it("Should create a new location with name and lat/long", async () => {
    expect.assertions(5);

    const location: IGpsLocation = new GpsLocation(validLocation);
    const spy = jest.spyOn(location, "save");
    const savedLocation: IGpsLocation = await location.save();

    expect(spy).toHaveBeenCalled();

    expect(savedLocation).toMatchObject({
      name: expect.any(String),
      latitude: expect.any(Number),
      longitude: expect.any(Number),
    });

    expect(savedLocation.name).toBe("Test Location");
    expect(savedLocation.latitude).toBe(45.509416);
    expect(savedLocation.longitude).toBe(-75.8100346);
  });
});
