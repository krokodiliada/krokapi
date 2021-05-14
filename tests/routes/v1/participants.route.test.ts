import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import {
  populateSampleDatabase,
  eraseSampleDatabase,
} from "../../utils/sampledb";

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
    await mongoose.connection.close();
  });

  // GET methods

  // GET /participants/
  it("Should return a list of all participants", async () => {
    const res = await request(app).get("/v1/participants/");

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
      "/v1/participants/5f8d0d55b54764421b715d8d"
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
    const res = await request(app).get("/v1/participants/5f8d0d554421b715d8d");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d0d554421b715d8d' is not a valid object id",
    });
  });

  it("Should return 404 if participant is not found", async () => {
    const res = await request(app).get(
      "/v1/participants/5f8d0d43b54764421b715d8d"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Participant with this id does not exist",
    });
  });

  // DELETE /participants/:id
  it("Should return 400 if deleting participant by invalid id", async () => {
    const res = await request(app).delete(
      "/v1/participants/5f8d0d554421b715d8d"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d0d554421b715d8d' is not a valid object id",
    });
  });

  it("Should return 404 if deleting inexistent participant", async () => {
    const res = await request(app).delete(
      "/v1/participants/5f8d0d55b53264421b615d5e"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Participant with this id does not exist",
    });
  });

  it("Should return 200 if successfully deleted participant", async () => {
    const res = await request(app).delete(
      "/v1/participants/5f8d0d55b54764421b715d5e"
    );
    expect(res.status).toEqual(StatusCodes.NO_CONTENT);
    expect(res.type).toBe("");
  });

  it("Should return 404 if deleting same participant twice", async () => {
    await request(app).delete("/v1/participants/5f8d0d55b54764421b715d5d");
    const res = await request(app).delete(
      "/v1/participants/5f8d0d55b54764421b715d5d"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Participant with this id does not exist",
    });
  });

  // POST /participants/
  it("Should return 405 if post is not allowed to update participant", async () => {
    const res = await request(app).post(
      "/v1/participants/5f8d0d55b54764421b715d64"
    );
    expect(res.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Method is not allowed. Check the API documentation",
    });
  });

  it("Should return 400 if creating participant without data", async () => {
    const res = await request(app).post("/v1/participants/").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Participant validation failed: birthday: Birthday is required, " +
        "name: Participant name is required",
    });
  });

  it("Should return 400 if creating participant with name only", async () => {
    const res = await request(app)
      .post("/v1/participants/")
      .send({
        name: {
          first: "Ivan",
          last: "Petrov",
        },
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Participant validation failed: birthday: Birthday is required",
    });
  });

  it("Should return 400 if creating participant with birthday only", async () => {
    const res = await request(app)
      .post("/v1/participants/")
      .send({
        birthday: new Date("Dec 13, 1994"),
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Participant validation failed: name: Participant name is required",
    });
  });

  it("Should return 400 if creating participant with invalid name", async () => {
    const res = await request(app)
      .post("/v1/participants/")
      .send({
        name: {
          first: "15Names",
          last: 58.9,
        },
        birthday: new Date("Dec 13, 1994"),
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Participant validation failed: name.first: " +
        "Name must not contain digits or special characters, " +
        "name.last: Name must not contain digits or special characters, " +
        "name: Validation failed: first: " +
        "Name must not contain digits or special characters, " +
        "last: Name must not contain digits or special characters",
    });
  });

  it("Should return 400 if creating participant with invalid birthday", async () => {
    const res = await request(app)
      .post("/v1/participants/")
      .send({
        name: {
          first: "Ivan",
          last: "Petrov",
        },
        birthday: "Not a date",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Participant validation failed: birthday: " +
        "Cast to date failed for value " +
        '"Not a date" at path "birthday"',
    });
  });

  it("Should return 201 if successfully created a participant", async () => {
    const res = await request(app)
      .post("/v1/participants/")
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
    expect(res.headers.location).toMatch(
      /.*(\/v1\/participants\/)([a-f\d]{24})$/
    );
    expect(res.body).toMatchObject({
      _id: expect.any(String),
      name: {
        first: "Ivan",
        last: "Petrov",
      },
      birthday: new Date("Dec 13, 1994").toISOString(),
    });
  });

  it("Should return 201 if successfully created a participant with russian name", async () => {
    const res = await request(app)
      .post("/v1/participants/")
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
    expect(res.headers.location).toMatch(
      /.*(\/v1\/participants\/)([a-f\d]{24})$/
    );
    expect(res.body).toMatchObject({
      _id: expect.any(String),
      name: {
        first: "Иван",
        last: "Петров",
      },
      birthday: new Date("Dec 10, 1985").toISOString(),
    });
  });

  /**
   * For narticipants, pair {name, birthday} is unique across the collection,
   * so duplicating the same value should throw an error.
   */
  it("Should return 400 if creating participant that already exists", async () => {
    const firstCreationRes = await request(app)
      .post("/v1/participants/")
      .send({
        name: {
          first: "Petr",
          last: "Ivanov",
        },
        birthday: new Date("Sep 13, 1985"),
      });
    expect(firstCreationRes.status).toEqual(StatusCodes.CREATED);

    const res = await request(app)
      .post("/v1/participants/")
      .send({
        name: {
          first: "Petr",
          last: "Ivanov",
        },
        birthday: new Date("Sep 13, 1985"),
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body.error).toContain("E11000 duplicate key error dup key: ");
  });

  // PATCH /participants/:id
  it("Should return 400 if updating participant by invalid id", async () => {
    const res = await request(app).patch(
      "/v1/participants/5f8d0d554421b715d8d"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d0d554421b715d8d' is not a valid object id",
    });
  });

  it("Should return 404 if updating participant by inexistent id", async () => {
    const res = await request(app).patch(
      "/v1/participants/5f8d0d43b54764421b715d8d"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Participant with this id does not exist",
    });
  });

  it("Should return 400 if updating participant with empty data", async () => {
    const res = await request(app)
      .patch("/v1/participants/5f8d0d55b54764421b715c08")
      .send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Empty request body is received",
    });
  });

  it("Should return 200 if updating participant's full name", async () => {
    const res = await request(app)
      .patch("/v1/participants/5f8d0d55b54764421b715d4a")
      .send({
        name: {
          first: "Ivan",
          last: "Petrov",
        },
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8d0d55b54764421b715d4a",
      name: { first: "Ivan", last: "Petrov" },
      birthday: new Date("1931-08-22").toISOString(),
      phone: "+79528260940",
      email: "nicholas70@mills.org",
    });
  });

  it("Should return 200 if updating participant's birthday", async () => {
    const res = await request(app)
      .patch("/v1/participants/5f8d0d55b54764421b715d6e")
      .send({
        birthday: new Date("Oct 8, 1958"),
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8d0d55b54764421b715d6e",
      name: { first: "Ashley", last: "Robinson" },
      birthday: new Date("Oct 8, 1958").toISOString(),
      phone: "+79574428340",
      email: "alexanderbradshaw@wiley.com",
    });
  });

  /**
   * Updating a single field of a nested object should be allowed
   */
  it("Should return 200 if updating participant's first name", async () => {
    const res = await request(app)
      .patch("/v1/participants/5f8d0d55b54764421b715d6f")
      .send({
        "name.first": "Ivan",
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8d0d55b54764421b715d6f",
      name: { first: "Ivan", last: "Bender" },
      birthday: new Date("2020-09-12").toISOString(),
      phone: "+79433643904",
      email: "ebailey@hotmail.com",
    });
  });

  /**
   * Both first and last name are required for the name object
   */
  it("Should return 400 if updating participant's name with incomplete data", async () => {
    const res = await request(app)
      .patch("/v1/participants/5f8d0d55b54764421b715d4a")
      .send({
        name: {
          first: "Ivan",
        },
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Participant validation failed: " +
        "name.last: Last name is required, " +
        "name: Validation failed: last: Last name is required",
    });
  });

  it("Should return 400 if updating participant's birthday with invalid data", async () => {
    const res = await request(app)
      .patch("/v1/participants/5f8d0d55b54764421b715d4a")
      .send({
        birthday: "Pssss",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Participant validation failed: birthday: " +
        'Cast to date failed for value "Pssss" at path "birthday"',
    });
  });

  it("Should return 400 if updating participant's email with invalid data", async () => {
    const res1 = await request(app)
      .patch("/v1/participants/5f8d0d55b54764421b715d4a")
      .send({
        email: "Haha",
      });
    expect(res1.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res1.body).toMatchObject({
      error: "Participant validation failed: email: Invalid email",
    });

    const res2 = await request(app)
      .patch("/v1/participants/5f8d0d55b54764421b715d4a")
      .send({
        email: "moo@mail",
      });
    expect(res2.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res2.body).toMatchObject({
      error: "Participant validation failed: email: Invalid email",
    });

    const res3 = await request(app)
      .patch("/v1/participants/5f8d0d55b54764421b715d4a")
      .send({
        email: 13,
      });
    expect(res3.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res3.body).toMatchObject({
      error: "Participant validation failed: email: Invalid email",
    });
  });

  it("Should return 400 if updating participant's phone with invalid data", async () => {
    const res1 = await request(app)
      .patch("/v1/participants/5f8d0d55b54764421b715d4a")
      .send({
        phone: "-7-916-438-1356",
      });
    expect(res1.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res1.body).toMatchObject({
      error:
        "Participant validation failed: phone: " +
        "-7-916-438-1356 is not a valid phone number",
    });

    const res2 = await request(app)
      .patch("/v1/participants/5f8d0d55b54764421b715d4a")
      .send({
        phone: "Haha",
      });
    expect(res2.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res2.body).toMatchObject({
      error:
        "Participant validation failed: phone: Haha is not a valid phone number",
    });

    const res3 = await request(app)
      .patch("/v1/participants/5f8d0d55b54764421b715d4a")
      .send({
        phone: 89096847263,
      });
    expect(res3.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res3.body).toMatchObject({
      error:
        "Participant validation failed: phone: " +
        "89096847263 is not a valid phone number",
    });
  });

  it("Should return 200 if successfully updated phone and email", async () => {
    const res = await request(app)
      .patch("/v1/participants/5f8d0d55b54764421b715d4c")
      .send({
        phone: "+79152786543",
        email: "mama@yandex.ru",
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8d0d55b54764421b715d4c",
      name: { first: "Daniel", last: "Castaneda" },
      birthday: new Date("1993-12-18").toISOString(),
      phone: "+79152786543",
      email: "mama@yandex.ru",
    });
  });
});
