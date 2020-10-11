import mongoose from "mongoose";
import faker from "faker";
import Participant, { IParticipant } from "model/Participant";

const validParticipant: IParticipant = new Participant({
  name: {
    first: "Ivan",
    last: "Petrov",
  },
  birthday: new Date("Oct 13 1985"),
});

describe("Participant model", () => {
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
    expect.assertions(10);

    const participant: IParticipant = new Participant(validParticipant);

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

    expect(savedParticipant.birthday.getFullYear()).toBe(1985);
    expect(savedParticipant.birthday.getMonth()).toBe(9);
    expect(savedParticipant.birthday.getDate()).toBe(13);
    expect(savedParticipant.name.middle).toBeUndefined();
    expect(savedParticipant.email).toBeUndefined();
    expect(savedParticipant.phone).toBeUndefined();
    expect(savedParticipant.createdAt.getDate()).toBe(new Date().getDate());
    expect(savedParticipant.updatedAt.getDate()).toBe(new Date().getDate());
  });

  it("Throws an error if phone is not in valid format", () => {
    let participant: IParticipant = new Participant(validParticipant);

    participant.phone = "433-927-5687";
    expect(participant.validate).toThrow();

    participant.phone = "+1 433-927-5687";
    expect(participant.validate).toThrow();

    participant.phone = "257-09-13";
    expect(participant.validate).toThrow();

    participant.phone = "2570913";
    expect(participant.validate).toThrow();

    participant.phone = "926-173-1919";
    expect(participant.validate).toThrow();

    participant.phone = "89261731919";
    expect(participant.validate).toThrow();

    participant.phone = "+7 (926) 173-1919";
    expect(participant.validate).toThrow();
  });

  it("Throws an error if email is not in valid format", () => {
    let participant: IParticipant = new Participant(validParticipant);

    participant.email = "hello";
    expect(participant.validate).toThrow();

    participant.email = "hello@ca";
    expect(participant.validate).toThrow();

    participant.email = "hello@ca@ma";
    expect(participant.validate).toThrow();

    participant.email = "45354.com";
    expect(participant.validate).toThrow();
  });

  it("Should validate a proper email correctly", () => {
    let participant: IParticipant = new Participant(validParticipant);
    const numAttempts = 100;

    expect.assertions(numAttempts);

    for (let i = 0; i < numAttempts; i++) {
      participant.email = faker.internet.email();
      const error = participant.validateSync();
      expect(error).toBeUndefined();
    }
  });

  it("Should validate a proper phone correctly", () => {
    let participant: IParticipant = new Participant(validParticipant);

    participant.phone = "+79261731919";
    const error = participant.validateSync();
    expect(error).toBeUndefined();
  });

  it("Throws an error if two people have the same name and bday", async () => {
    const participant: IParticipant = new Participant({
      name: {
        first: "Mihail",
        last: "Ponchikov",
      },
      birthday: new Date("Nov 23 1993"),
    });

    const spy = jest.spyOn(participant, "save");
    await participant.save();
    expect(spy).toHaveBeenCalled();

    const secondParticipant: IParticipant = new Participant({
      name: {
        first: participant.name.first,
        last: participant.name.last,
      },
      birthday: participant.birthday,
    });

    await expect(Participant.create(secondParticipant)).rejects.toThrowError();
  });
});
