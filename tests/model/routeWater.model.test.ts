import mongoose from "mongoose";
import faker from "faker";

import Category, { ICategory } from "model/Category";
import Event, { IEvent } from "model/Event";
import Participant, { IParticipant } from "model/Participant";
import RouteWater, { IRouteWater } from "model/RouteWater";
import Team, { ITeam } from "model/Team";

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

const participant: IParticipant = new Participant({
  name: {
    first: "Ivan",
    last: "Petrov",
  },
  birthday: new Date("Oct 13 1985"),
});

const team: ITeam = new Team({
  name: "Test Team",
  participants: [participant._id],
  event: event._id,
  category: category._id,
});

const validRoute: IRouteWater = new RouteWater({
  team: team._id,
  start: new Date("2020-09-25T10:13:00"),
  finish: new Date("2020-09-25T10:14:00"),
});

describe("RouteWater model", () => {
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
    await Team.deleteMany({});
    await RouteWater.deleteMany({});
  });

  it("Throws an error if route is created without parameters", () => {
    const route: IRouteWater = new RouteWater();
    expect(route.validate).toThrow();
  });

  it("Throws an error if route is created without team", () => {
    const route: IRouteWater = new RouteWater({
      start: new Date("2020-09-25T10:13:00"),
      finish: new Date("2020-09-25T10:14:00"),
    });
    expect(route.validate).toThrow();
  });

  it("Throws an error if finish date is prior to the start date", () => {
    const route: IRouteWater = new RouteWater({
      team: team._id,
      start: new Date("2020-09-25T10:14:00"),
      finish: new Date("2020-09-25T10:13:00"),
    });
    expect(route.validate).toThrow();
  });

  it("Should create a new route with an empty array of actions", async () => {
    expect.assertions(5);

    const route: IRouteWater = new RouteWater(validRoute);
    const spy = jest.spyOn(route, "save");
    const savedRoute: IRouteWater = await route.save();

    expect(spy).toHaveBeenCalled();

    expect(savedRoute).toMatchObject({
      team: expect.any(Object),
      start: expect.any(Date),
      finish: expect.any(Date),
      actions: expect.any(Array),
    });

    expect(savedRoute.start.getMinutes()).toBe(13);
    expect(savedRoute.finish.getMinutes()).toBe(14);
    expect(savedRoute.actions.length).toBe(0);
  });
});
