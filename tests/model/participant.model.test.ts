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

  it("Throws an error if participant is created without parameters", async () => {
    const participant: IParticipant = new Participant();
    await expect(Participant.create(participant)).rejects.toThrowError();
  });

  it("Throws an error if participant is created with name only", async () => {
    const participant: IParticipant = new Participant({
      name: {
        first: "Ivan",
        last: "Petrov",
      },
    });
    await expect(Participant.create(participant)).rejects.toThrowError();
  });

  it("Throws an error if participant is created with birthday only", async () => {
    const participant: IParticipant = new Participant({
      birthday: new Date("Dec 9 1992"),
    });
    await expect(Participant.create(participant)).rejects.toThrowError();
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

  it("Throws an error if phone is not in valid format", async () => {
    const participant: IParticipant = new Participant(validParticipant);

    participant.phone = "433-927-5687";
    await expect(Participant.create(participant)).rejects.toThrowError();

    participant.phone = "+1 433-927-5687";
    await expect(Participant.create(participant)).rejects.toThrowError();

    participant.phone = "257-09-13";
    await expect(Participant.create(participant)).rejects.toThrowError();

    participant.phone = "2570913";
    await expect(Participant.create(participant)).rejects.toThrowError();

    participant.phone = "926-173-1919";
    await expect(Participant.create(participant)).rejects.toThrowError();

    participant.phone = "89261731919";
    await expect(Participant.create(participant)).rejects.toThrowError();

    participant.phone = "+7 (926) 173-1919";
    await expect(Participant.create(participant)).rejects.toThrowError();
  });

  it("Throws an error if email is not in valid format", async () => {
    const participant: IParticipant = new Participant(validParticipant);

    participant.email = "hello";
    await expect(Participant.create(participant)).rejects.toThrowError();

    participant.email = "hello@ca";
    await expect(Participant.create(participant)).rejects.toThrowError();

    participant.email = "hello@ca@ma";
    await expect(Participant.create(participant)).rejects.toThrowError();

    participant.email = "45354.com";
    await expect(Participant.create(participant)).rejects.toThrowError();
  });

  it("Should validate a proper email correctly", async () => {
    const numAttempts = 100;
    expect.assertions(numAttempts);

    for (let i = 0; i < numAttempts; i++) {
      const participant: IParticipant = new Participant({
        name: {
          first: faker.name.firstName(),
          last: faker.name.lastName(),
        },
        birthday: faker.date.past(),
        email: faker.internet.email(),
      });
      // eslint-disable-next-line no-return-await
      expect(async () => await Participant.create(participant)).not.toThrow();
    }
  });

  it("Should validate a proper phone correctly", () => {
    const participant: IParticipant = new Participant(validParticipant);

    participant.phone = "+79261731919";
    expect(async () => Participant.create(participant)).not.toThrow();
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

  it("Throws an error if participant's first name has special characters", async () => {
    const participant: IParticipant = new Participant({
      name: {
        first: "Ivan-13",
        last: "Petrov",
      },
      birthday: new Date("Oct 13 1986"),
    });
    await expect(Participant.create(participant)).rejects.toThrowError();
  });

  it("Throws an error if participant's second name has special characters", async () => {
    const participant: IParticipant = new Participant({
      name: {
        first: "Ivan",
        last: "@_%Petrov",
      },
      birthday: new Date("Oct 13 1986"),
    });
    await expect(Participant.create(participant)).rejects.toThrowError();
  });
});
