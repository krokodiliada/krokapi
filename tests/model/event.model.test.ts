import mongoose from "mongoose";
import faker from "faker";
import Event, { IEvent } from "model/Event";

const validEvent: IEvent = new Event({
  number: 50,
  date: {
    start: new Date("Sep 25, 2020"),
    end: new Date("Sep 27, 2020"),
  },
});

describe("Event model", () => {
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
    await Event.deleteMany({});
  });

  it("Throws an error if event is created without parameters", () => {
    const event: IEvent = new Event();
    expect(event.validate).toThrow();
  });

  it("Throws an error if event is created with number only", () => {
    const event: IEvent = new Event({
      number: 50,
    });
    expect(event.validate).toThrow();
  });

  it("Should create a new event with number and start/end date", async () => {
    expect.assertions(7);

    const event: IEvent = new Event(validEvent);

    const spy = jest.spyOn(event, "save");

    // Should await so the teardown doesn't throw an exception
    const savedEvent: IEvent = await event.save();

    expect(spy).toHaveBeenCalled();

    expect(savedEvent).toMatchObject({
      number: expect.any(Number),
      date: {
        start: expect.any(Date),
        end: expect.any(Date),
      },
    });

    expect(savedEvent.date.start.getFullYear()).toBe(2020);
    expect(savedEvent.date.start.getDate()).toBe(25);
    expect(savedEvent.date.end.getDate()).toBe(27);
    expect(savedEvent.season).toBe("fall");
    expect(savedEvent.location).toBeUndefined();
  });

  it("Check that season is set correctly based on the event number", () => {
    const numAttempts = 100;

    expect.assertions(numAttempts * 2);

    for (let i = 0; i < numAttempts; i++) {
      const eventNumber = faker.random.number({ min: 0, max: 150 });
      const event: IEvent = new Event({
        number: eventNumber,
        date: validEvent.date,
      });

      const error = event.validateSync();

      const expectedSeason = eventNumber % 2 === 0 ? "fall" : "spring";
      expect(event.season).toBe(expectedSeason);
      expect(error).toBeUndefined();
    }
  });

  it("Throws an error when two Events have the same number", async () => {
    const event: IEvent = new Event(validEvent);

    const spy = jest.spyOn(event, "save");
    await event.save();
    expect(spy).toHaveBeenCalled();

    const secondEvent: IEvent = new Event({
      number: validEvent.number,
      date: validEvent.date,
    });

    await expect(Event.create(secondEvent)).rejects.toThrowError();
  });

  it("Throws an error when two Events have the same date", async () => {
    const event: IEvent = new Event(validEvent);

    const spy = jest.spyOn(event, "save");
    await event.save();
    expect(spy).toHaveBeenCalled();

    const secondEvent: IEvent = new Event({
      number: validEvent.number + 1,
      date: {
        start: validEvent.date.start,
        end: validEvent.date.end,
      },
    });

    await expect(Event.create(secondEvent)).rejects.toThrowError();
  });
});
