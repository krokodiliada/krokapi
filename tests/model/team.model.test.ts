import mongoose from "mongoose";
import faker from "faker";

import Category, { ICategory } from "model/Category";
import Krok, { IKrok } from "model/Krok";
import Participant, { IParticipant } from "model/Participant";
import Team, { ITeam } from "model/Team";

const category: ICategory = new Category({
  name: {
    short: faker.name.firstName(),
    long: faker.name.lastName(),
  },
});

const krok: IKrok = new Krok({
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
  krok: krok._id,
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

  it("Throws an error if team is created without parameters", () => {
    const team: ITeam = new Team();
    expect(team.validate).toThrow();
  });

  it("Throws an error if team is created without participants", () => {
    const team: ITeam = new Team({
      name: "Test Team",
      participants: [],
      krok: krok._id,
      category: category._id,
    });
    expect(team.validate).toThrow();
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
      krok: expect.any(Object),
      category: expect.any(Object),
      extraMapRequired: expect.any(Boolean),
    });

    expect(savedTeam.extraMapRequired).toBe(false);
  });
});
