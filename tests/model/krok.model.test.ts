import mongoose from "mongoose";
import faker from "faker";
import Krok, { IKrok } from "model/Krok";

const validKrok: IKrok = new Krok({
  number: 50,
  date: {
    start: new Date("Sep 25, 2020"),
    end: new Date("Sep 27, 2020"),
  },
});

describe("Krok model", () => {
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
    await Krok.deleteMany({});
  });

  it("Throws an error if krok is created without parameters", () => {
    const krok: IKrok = new Krok();
    expect(krok.validate).toThrow();
  });

  it("Throws an error if krok is created with number only", () => {
    const krok: IKrok = new Krok({
      number: 50,
    });
    expect(krok.validate).toThrow();
  });

  it("Should create a new krok with number and start/end date", async () => {
    expect.assertions(7);

    const krok: IKrok = new Krok(validKrok);

    const spy = jest.spyOn(krok, "save");

    // Should await so the teardown doesn't throw an exception
    const savedKrok: IKrok = await krok.save();

    expect(spy).toHaveBeenCalled();

    expect(savedKrok).toMatchObject({
      number: expect.any(Number),
      date: {
        start: expect.any(Date),
        end: expect.any(Date),
      },
    });

    expect(savedKrok.date.start.getFullYear()).toBe(2020);
    expect(savedKrok.date.start.getDate()).toBe(25);
    expect(savedKrok.date.end.getDate()).toBe(27);
    expect(savedKrok.season).toBe("fall");
    expect(savedKrok.location).toBeUndefined();
  });

  it("Check that season is set correctly based on the krok number", () => {
    const numAttempts = 100;

    expect.assertions(numAttempts * 2);

    for (let i = 0; i < numAttempts; i++) {
      const krokNumber = faker.random.number({ min: 0, max: 150 });
      const krok: IKrok = new Krok({
        number: krokNumber,
        date: validKrok.date,
      });

      const error = krok.validateSync();

      const expectedSeason = krokNumber % 2 === 0 ? "fall" : "spring";
      expect(krok.season).toBe(expectedSeason);
      expect(error).toBeUndefined();
    }
  });

  it("Throws an error when two Kroks have the same number", async () => {
    const krok: IKrok = new Krok(validKrok);

    const spy = jest.spyOn(krok, "save");
    await krok.save();
    expect(spy).toHaveBeenCalled();

    const secondKrok: IKrok = new Krok({
      number: validKrok.number,
      date: validKrok.date,
    });

    await expect(Krok.create(secondKrok)).rejects.toThrowError();
  });

  it("Throws an error when two Kroks have the same date", async () => {
    const krok: IKrok = new Krok(validKrok);

    const spy = jest.spyOn(krok, "save");
    await krok.save();
    expect(spy).toHaveBeenCalled();

    const secondKrok: IKrok = new Krok({
      number: validKrok.number + 1,
      date: {
        start: validKrok.date.start,
        end: validKrok.date.end,
      },
    });

    await expect(Krok.create(secondKrok)).rejects.toThrowError();
  });
});
