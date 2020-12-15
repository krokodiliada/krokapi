import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import { populateSampleDatabase, eraseSampleDatabase } from "../utils/sampledb";

describe("Participant endpoints", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL ?? "", {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await populateSampleDatabase();
  });

  afterAll(async () => {
    await eraseSampleDatabase();
    mongoose.connection.close();
  });

  // GET methods

  // GET /participants/
  it("Should return a list of all participants", async () => {
    const res = await request(app).get("/participants/");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBeGreaterThan(1);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      name: {
        first: expect.any(String),
        last: expect.any(String),
      },
      birthday: expect.any(String),
      phone: expect.any(String),
      email: expect.any(String),
    });
  });

  // GET /participants/:id
  it("Should return a participant by id and status 200", async () => {
    const res = await request(app).get(
      "/participants/5f8d0d55b54764421b715d8d"
    );

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8d0d55b54764421b715d8d",
      name: { first: "Diane", last: "Little" },
      birthday: new Date("2014-12-29").toISOString(),
      phone: "+79565608693",
      email: "perezronald@yahoo.com",
    });
  });

  it("Should return 400 if requesting participant by invalid id", async () => {
    const res = await request(app).get("/participants/5f8d0d554421b715d8d");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if participant is not found", async () => {
    const res = await request(app).get(
      "/participants/5f8d0d43b54764421b715d8d"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // DELETE /participants/:id
  it("Should return 400 if deleting participant by invalid id", async () => {
    const res = await request(app).delete("/participants/5f8d0d554421b715d8d");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if deleting inexistent participant", async () => {
    const res = await request(app).delete(
      "/participants/5f8d0d55b53264421b615d5e"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if successfully deleted participant", async () => {
    const res = await request(app).delete(
      "/participants/5f8d0d55b54764421b715d5e"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if deleting same participant twice", async () => {
    await request(app).delete("/participants/5f8d0d55b54764421b715d5d");
    const res = await request(app).delete(
      "/participants/5f8d0d55b54764421b715d5d"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // POST /participants/
  it("Should return 405 if post is not allowed to update participant", async () => {
    const res = await request(app).post(
      "/participants/5f8d0d55b54764421b715d64"
    );
    expect(res.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating participant without data", async () => {
    const res = await request(app).post("/participants/").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating participant with name only", async () => {
    const res = await request(app)
      .post("/participants/")
      .send({
        name: {
          first: "Ivan",
          last: "Petrov",
        },
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating participant with birthday only", async () => {
    const res = await request(app)
      .post("/participants/")
      .send({
        birthday: new Date("Dec 13, 1994"),
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating participant with invalid name", async () => {
    const res = await request(app)
      .post("/participants/")
      .send({
        name: {
          first: "15Names",
          last: 58.9,
        },
        birthday: new Date("Dec 13, 1994"),
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating participant with invalid birthday", async () => {
    const res = await request(app)
      .post("/participants/")
      .send({
        name: {
          first: "Ivan",
          last: "Petrov",
        },
        birthday: "That's not a date variable",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 201 if successfully created a participant", async () => {
    const res = await request(app)
      .post("/participants/")
      .send({
        name: {
          first: "Ivan",
          last: "Petrov",
        },
        birthday: new Date("Dec 13, 1994"),
      });
    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
    // regex for response like /participants/5f8d0d55b54764421b715d5d
    expect(res.headers.location).toMatch(/.*(\/participants\/)([a-f\d]{24})$/);
  });

  it("Should return 201 if successfully created a participant with russian name", async () => {
    const res = await request(app)
      .post("/participants/")
      .send({
        name: {
          first: "Иван",
          last: "Петров",
        },
        birthday: new Date("Dec 10, 1985"),
      });
    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
    // regex for response like /participants/5f8d0d55b54764421b715d5d
    expect(res.headers.location).toMatch(/.*(\/participants\/)([a-f\d]{24})$/);
  });

  /**
   * For narticipants, pair {name, birthday} is unique across the collection,
   * so duplicating the same value should throw an error.
   */
  it("Should return 400 if creating participant that already exists", async () => {
    const firstCreationRes = await request(app)
      .post("/participants/")
      .send({
        name: {
          first: "Petr",
          last: "Ivanov",
        },
        birthday: new Date("Sep 13, 1985"),
      });
    expect(firstCreationRes.status).toEqual(StatusCodes.CREATED);

    const res = await request(app)
      .post("/participants/")
      .send({
        name: {
          first: "Petr",
          last: "Ivanov",
        },
        birthday: new Date("Sep 13, 1985"),
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  // PATCH /participants/:id
  it("Should return 400 if updating participant by invalid id", async () => {
    const res = await request(app).patch("/participants/5f8d0d554421b715d8d");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if updating participant by inexistent id", async () => {
    const res = await request(app).patch(
      "/participants/5f8d0d43b54764421b715d8d"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if updating participant with empty data", async () => {
    const res = await request(app)
      .patch("/participants/5f8d0d554421b715d8d")
      .send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if updating participant's full name", async () => {
    const res = await request(app)
      .patch("/participants/5f8d0d55b54764421b715d4a")
      .send({
        name: {
          first: "Ivan",
          last: "Petrov",
        },
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if updating participant's birthday", async () => {
    const res = await request(app)
      .patch("/participants/5f8d0d55b54764421b715d4a")
      .send({
        birthday: new Date("Oct 8, 1958"),
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  /**
   * Updating a single field of a nested object should be allowed
   */
  it("Should return 200 if updating participant's first name", async () => {
    const res = await request(app)
      .patch("/participants/5f8d0d55b54764421b715d4a")
      .send({
        "name.first": "Ivan",
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  /**
   * Both first and last name are required for the name object
   */
  it("Should return 400 if updating participant's name with incomplete data", async () => {
    const res = await request(app)
      .patch("/participants/5f8d0d55b54764421b715d4a")
      .send({
        name: {
          first: "Ivan",
        },
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if updating participant's birthday with invalid data", async () => {
    const res = await request(app)
      .patch("/participants/5f8d0d55b54764421b715d4a")
      .send({
        birthday: "Pssss",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if updating participant's email with invalid data", async () => {
    const res1 = await request(app)
      .patch("/participants/5f8d0d55b54764421b715d4a")
      .send({
        email: "Haha",
      });
    expect(res1.status).toEqual(StatusCodes.BAD_REQUEST);

    const res2 = await request(app)
      .patch("/participants/5f8d0d55b54764421b715d4a")
      .send({
        email: "moo@mail",
      });
    expect(res2.status).toEqual(StatusCodes.BAD_REQUEST);

    const res3 = await request(app)
      .patch("/participants/5f8d0d55b54764421b715d4a")
      .send({
        email: 13,
      });
    expect(res3.status).toEqual(StatusCodes.BAD_REQUEST);
  });

  it("Should return 400 if updating participant's phone with invalid data", async () => {
    const res1 = await request(app)
      .patch("/participants/5f8d0d55b54764421b715d4a")
      .send({
        phone: "-7-916-438-1356",
      });
    expect(res1.status).toEqual(StatusCodes.BAD_REQUEST);

    const res2 = await request(app)
      .patch("/participants/5f8d0d55b54764421b715d4a")
      .send({
        phone: "Haha",
      });
    expect(res2.status).toEqual(StatusCodes.BAD_REQUEST);

    const res3 = await request(app)
      .patch("/participants/5f8d0d55b54764421b715d4a")
      .send({
        phone: 89096847263,
      });
    expect(res3.status).toEqual(StatusCodes.BAD_REQUEST);
  });

  it("Should return 200 if successfully updated phone and email", async () => {
    const res = await request(app)
      .patch("/participants/5f8d0d55b54764421b715d4c")
      .send({
        phone: "+79152786543",
        email: "mama@yandex.ru",
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });
});
