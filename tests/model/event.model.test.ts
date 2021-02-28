import mongoose from "mongoose";
import Event, { IEvent } from "model/Event";

const validEvent: IEvent = new Event({
  name: "New Event",
  date: {
    start: new Date("Sep 25, 2023"),
    end: new Date("Sep 27, 2023"),
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

  it("Throws an error if event is created without parameters", async () => {
    const event: IEvent = new Event();
    await expect(Event.create(event)).rejects.toThrowError();
  });

  it("Throws an error if event is created with name only", async () => {
    const event: IEvent = new Event({
      name: "New Event",
    });
    await expect(Event.create(event)).rejects.toThrowError();
  });

  it("Throws an error if event's start date is later than end date", async () => {
    const event: IEvent = new Event({
      name: "New Event",
      date: {
        start: new Date("May 25, 2022"),
        end: new Date("May 24, 2022"),
      },
    });
    await expect(Event.create(event)).rejects.toThrowError();
  });

  it("Should create a new event with name and start/end date", async () => {
    expect.assertions(6);

    const event: IEvent = new Event(validEvent);

    const spy = jest.spyOn(event, "save");

    // Should await so the teardown doesn't throw an exception
    const savedEvent: IEvent = await event.save();

    expect(spy).toHaveBeenCalled();

    expect(savedEvent).toMatchObject({
      name: expect.any(String),
      date: {
        start: expect.any(Date),
        end: expect.any(Date),
      },
    });

    expect(savedEvent.date.start.getFullYear()).toBe(2023);
    expect(savedEvent.date.start.getDate()).toBe(25);
    expect(savedEvent.date.end.getDate()).toBe(27);
    expect(savedEvent.location).toBeUndefined();
  });

  it("Throws an error when two Events have the same date", async () => {
    const event: IEvent = new Event(validEvent);

    const spy = jest.spyOn(event, "save");
    await event.save();
    expect(spy).toHaveBeenCalled();

    const secondEvent: IEvent = new Event({
      name: "Another Event",
      date: {
        start: validEvent.date.start,
        end: validEvent.date.end,
      },
    });

    await expect(Event.create(secondEvent)).rejects.toThrowError();
  });
});
