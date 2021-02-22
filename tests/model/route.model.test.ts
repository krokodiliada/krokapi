import mongoose from "mongoose";

import Event, { IEvent } from "model/Event";
import Route, { IRoute } from "model/Route";
import Participant, { IParticipant } from "model/Participant";
import TagAssignment, { ITagAssignment } from "model/TagAssignment";

const participant: IParticipant = new Participant({
  name: {
    first: "Ivan",
    last: "Petrov",
  },
  birthday: new Date("Dec 12, 1991"),
});

const event: IEvent = new Event({
  number: 172,
  date: {
    start: new Date("Sep 25, 2020"),
    end: new Date("Sep 27, 2020"),
  },
});

const tagAssignment: ITagAssignment = new TagAssignment({
  tag: 5002,
  participant: participant._id,
  event: event._id,
});

const validRoute: IRoute = new Route({
  tagAssignment: tagAssignment._id,
  start: new Date("2020-09-25T10:13:00"),
  finish: new Date("2020-09-25T10:14:00"),
});

describe("Route model", () => {
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
    await Participant.deleteMany({});
    await Event.deleteMany({});
    await TagAssignment.deleteMany({});
    await Route.deleteMany({});
  });

  it("Throws an error if route is created without parameters", async () => {
    const route: IRoute = new Route();
    await expect(Route.create(route)).rejects.toThrowError();
  });

  it("Throws an error if route is created without tag assignment", async () => {
    const route: IRoute = new Route({
      start: new Date("2020-09-25T10:13:00"),
      finish: new Date("2020-09-25T10:14:00"),
    });
    await expect(Route.create(route)).rejects.toThrowError();
  });

  it("Throws an error if route is created without start timestamp", async () => {
    const route: IRoute = new Route({
      tagAssignment: tagAssignment._id,
      finish: new Date("2020-09-25T10:14:00"),
    });
    await expect(Route.create(route)).rejects.toThrowError();
  });

  it("Throws an error if finish date is prior to the start date", async () => {
    const route: IRoute = new Route({
      tagAssignment,
      start: new Date("2020-09-25T10:14:00"),
      finish: new Date("2020-09-25T10:13:00"),
    });
    await expect(Route.create(route)).rejects.toThrowError();
  });

  it("Should create a new route with an empty array of actions", async () => {
    expect.assertions(5);

    const route: IRoute = new Route(validRoute);
    const spy = jest.spyOn(route, "save");
    const savedRoute: IRoute = await route.save();

    expect(spy).toHaveBeenCalled();

    expect(savedRoute).toMatchObject({
      tagAssignment: expect.any(Object),
      start: expect.any(Date),
      finish: expect.any(Date),
      actions: expect.any(Array),
    });

    expect(savedRoute.start.getMinutes()).toBe(13);
    expect(savedRoute.finish.getMinutes()).toBe(14);
    expect(savedRoute.actions.length).toBe(0);
  });
});
