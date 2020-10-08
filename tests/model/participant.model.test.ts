import * as dotenv from "dotenv";
import mongoose from "mongoose";
import Participant, { IParticipant } from "model/Participant";

dotenv.config();

describe("User model", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI ?? "", {
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
    expect.assertions(5);

    const participant: IParticipant = new Participant({
      name: {
        first: "Ivan",
        last: "Petrov",
      },
      birthday: new Date("Dec 9 1992"),
    });

    const spy = jest.spyOn(participant, "save");

    // Should await so the teardown doesn't throw an exception
    await participant.save();

    expect(spy).toHaveBeenCalled();

    expect(participant).toMatchObject({
      name: {
        first: expect.any(String),
        last: expect.any(String),
      },
      birthday: expect.any(Date),
    });

    expect(participant.birthday.getFullYear()).toBe(1992);
    expect(participant.birthday.getMonth()).toBe(11);
    expect(participant.birthday.getDate()).toBe(9);
  });
});
