import mongoose from "mongoose";
import faker from "faker";

import Category, { ICategory } from "model/Category";
import Event, { IEvent } from "model/Event";
import Participant, { IParticipant } from "model/Participant";
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

const validTeam: ITeam = new Team({
  name: "Test Team",
  participants: [participant._id],
  event: event._id,
  category: category._id,
});

describe("Team model", () => {
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
  });

  it("Throws an error if team is created without parameters", async () => {
    const team: ITeam = new Team();
    await expect(Team.create(team)).rejects.toThrowError();
  });

  it("Throws an error if team is created without participants", async () => {
    const team: ITeam = new Team({
      name: "Test Team",
      participants: [],
      event: event._id,
      category: category._id,
    });
    await expect(Team.create(team)).rejects.toThrowError();
  });

  it("Should create a new team with all required parameters", async () => {
    expect.assertions(3);

    const team: ITeam = new Team(validTeam);
    const spy = jest.spyOn(team, "save");
    const savedTeam: ITeam = await team.save();

    expect(spy).toHaveBeenCalled();

    expect(savedTeam).toMatchObject({
      name: expect.any(String),
      participants: expect.any(Array),
      event: expect.any(Object),
      category: expect.any(Object),
      extraMapRequired: expect.any(Boolean),
    });

    expect(savedTeam.extraMapRequired).toBe(false);
  });
});
