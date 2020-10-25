import mongoose from "mongoose";

import Krok, { IKrok } from "model/Krok";
import Participant, { IParticipant } from "model/Participant";
import Tag, { ITag } from "model/Tag";
import TagAssignment, { ITagAssignment } from "model/TagAssignment";

const tag: ITag = new Tag({
  number: 111,
});

const participant: IParticipant = new Participant({
  name: {
    first: "Ivan",
    last: "Petrov",
  },
  birthday: new Date("Oct 13 1985"),
});

const krok: IKrok = new Krok({
  number: 50,
  date: {
    start: new Date("Sep 25, 2020"),
    end: new Date("Sep 27, 2020"),
  },
});

const validAssignment: ITagAssignment = new TagAssignment({
  tag: tag._id,
  participant: participant._id,
  krok: krok._id,
});

describe("TagAssignment model", () => {
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
    await Tag.deleteMany({});
    await Krok.deleteMany({});
    await Participant.deleteMany({});
    await TagAssignment.deleteMany({});
  });

  it("Throws an error if tag assignment is created without parameters", () => {
    const assignment: ITagAssignment = new TagAssignment();
    expect(assignment.validate).toThrow();
  });

  it("Throws an error if tag assignment is created without tag", () => {
    const assignment: ITagAssignment = new TagAssignment({
      krok: krok._id,
      participant: participant._id,
    });
    expect(assignment.validate).toThrow();
  });

  it("Throws an error if tag assignment is created without krok", () => {
    const assignment: ITagAssignment = new TagAssignment({
      tag: tag._id,
      participant: participant._id,
    });
    expect(assignment.validate).toThrow();
  });

  it("Throws an error if tag assignment is created without participant", () => {
    const assignment: ITagAssignment = new TagAssignment({
      tag: tag._id,
      krok: krok._id,
    });
    expect(assignment.validate).toThrow();
  });

  it("Should create a new tag assignment with all parameters", async () => {
    expect.assertions(5);

    const assignment: ITagAssignment = new TagAssignment(validAssignment);
    const spy = jest.spyOn(assignment, "save");
    const savedAssignment: ITagAssignment = await assignment.save();

    expect(spy).toHaveBeenCalled();

    expect(savedAssignment).toMatchObject({
      tag: expect.any(Object),
      krok: expect.any(Object),
      participant: expect.any(Object),
    });

    expect(savedAssignment.tag).toBe(tag._id);
    expect(savedAssignment.krok).toBe(krok._id);
    expect(savedAssignment.participant).toBe(participant._id);
  });
});
