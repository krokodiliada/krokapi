import * as dotenv from "dotenv";
import mongoose from "mongoose";
import Participant, { IParticipant } from "model/Participant";

dotenv.config();

describe("User model", () => {
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

  it("Throws an error if participant is created without parameters", () => {
    const participant: IParticipant = new Participant();
    expect(participant.validate).toThrow();
  });

  it("Throws an error if participant is created with name only", () => {
    const participant: IParticipant = new Participant({
      name: {
        first: "Ivan",
        last: "Petrov",
      },
    });
    expect(participant.validate).toThrow();
  });

  it("Throws an error if participant is created with birthday only", () => {
    const participant: IParticipant = new Participant({
      birthday: new Date("Dec 9 1992"),
    });
    expect(participant.validate).toThrow();
  });

  it("Should create a user with name and birthday", async () => {
    expect.assertions(9);

    const participant: IParticipant = new Participant({
      name: {
        first: "Ivan",
        last: "Petrov",
      },
      birthday: new Date("Dec 9 1992"),
    });

    const spy = jest.spyOn(participant, "save");

    // Should await so the teardown doesn't throw an exception
    const savedParticipant: IParticipant = await participant.save();

    expect(spy).toHaveBeenCalled();

    expect(savedParticipant).toMatchObject({
      name: {
        first: expect.any(String),
        last: expect.any(String),
      },
      birthday: expect.any(Date),
    });

    expect(savedParticipant.birthday.getFullYear()).toBe(1992);
    expect(savedParticipant.birthday.getMonth()).toBe(11);
    expect(savedParticipant.birthday.getDate()).toBe(9);
    expect(savedParticipant.email).toBeUndefined();
    expect(savedParticipant.phone).toBeUndefined();
    expect(savedParticipant.createdAt.getDate()).toBe(new Date().getDate());
    expect(savedParticipant.updatedAt.getDate()).toBe(new Date().getDate());
  });
});
