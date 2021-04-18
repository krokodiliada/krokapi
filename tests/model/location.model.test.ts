import mongoose from "mongoose";
import Location, { ILocation } from "model/Location";

const validLocation: ILocation = new Location({
  name: "Test Location",
  latitude: 55.891833,
  longitude: 39.389303,
});

describe("Location model", () => {
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
  });

  it("Throws an error if location is created without parameters", async () => {
    const location: ILocation = new Location();
    await expect(Location.create(location)).rejects.toThrowError();
  });

  it("Throws an error if location name is not specified", async () => {
    const location: ILocation = new Location({
      latitude: 55.891833,
      longitude: 39.389303,
    });
    await expect(Location.create(location)).rejects.toThrowError();
  });

  it("Throws an error if location latitude is not specified", async () => {
    const location: ILocation = new Location({
      name: "New Test Location",
      longitude: 39.389303,
    });
    await expect(Location.create(location)).rejects.toThrowError();
  });

  it("Throws an error if location longitude is not specified", async () => {
    const location: ILocation = new Location({
      name: "New Test Location",
      latitude: 55.891833,
    });
    await expect(Location.create(location)).rejects.toThrowError();
  });

  it("Should create a new location with name only", async () => {
    expect.assertions(6);

    const location: ILocation = new Location(validLocation);
    const spy = jest.spyOn(location, "save");
    const savedLocation: ILocation = await location.save();

    expect(spy).toHaveBeenCalled();

    expect(savedLocation).toMatchObject({
      name: expect.any(String),
      latitude: expect.any(Number),
      longitude: expect.any(Number),
      water: expect.any(Boolean),
    });

    expect(savedLocation.description).toBeUndefined();
    expect(savedLocation.water).toBe(false);
    expect(savedLocation.note).toBeUndefined();
  });
});
