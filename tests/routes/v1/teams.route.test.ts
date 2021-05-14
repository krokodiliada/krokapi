import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import {
  populateSampleDatabase,
  eraseSampleDatabase,
} from "../../utils/sampledb";

describe("Team endpoints", () => {
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
  it("Should return a list of all teams", async () => {
    const res = await request(app).get("/v1/teams/");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBeGreaterThan(225);
    expect(res.body.length).toBeLessThan(235);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      name: expect.any(String),
      participants: expect.any(Array),
      event: expect.any(String),
      category: expect.any(Object),
      extraMapRequired: expect.any(Boolean),
      routes: expect.any(Array),
    });
  });

  // GET /teams/?event=:id
  it("Should return a list of all teams for specific event", async () => {
    const res = await request(app).get(
      "/v1/teams/?event=5f8d0401b54764421b7156da"
    );

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toMatchObject({
      _id: "5f90acf8b54764421a729193",
      name: "Sample Old",
      participants: [
        {
          _id: "5f8d0d55b54764421b715d99",
          name: { first: "James", last: "Reeves" },
          birthday: "2017-05-22T00:00:00.000Z",
          phone: "+79125905212",
          email: "tiffany87@allen.com",
        },
      ],
      event: "5f8d0401b54764421b7156da",
      category: {
        _id: "5f8d04f7b54764421b7156de",
        name: {
          short: "V",
          long: "Velo",
        },
        participantsNumber: {
          min: 1,
          max: 1,
        },
      },
      extraMapRequired: false,
    });
  });

  it("Should return 400 if event filter is invalid", async () => {
    const res = await request(app).get("/v1/teams/?event=5f8d0401b547641b71da");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d0401b547641b71da' is not a valid event id",
    });
  });

  it("Should return 404 if event does not exist", async () => {
    const res = await request(app).get(
      "/v1/teams/?event=5f8d0401b54764421a7136da"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Event with this id does not exist",
    });
  });

  // GET /teams/?category=:categoryId
  it("Should return a list of all teams for specific category", async () => {
    const res = await request(app).get(
      "/v1/teams/?category=5f8d04f7b54764421b7156df"
    );

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(25);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      name: expect.any(String),
      participants: expect.any(Array),
      event: expect.any(String),
      category: expect.any(Object),
      extraMapRequired: expect.any(Boolean),
      routes: expect.any(Array),
    });
  });

  it("Should return 400 if category filter is invalid", async () => {
    const res = await request(app).get(
      "/v1/teams/?category=5f84f7b5476442156df"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f84f7b5476442156df' is not a valid category id",
    });
  });

  it("Should return 404 if category does not exist", async () => {
    const res = await request(app).get(
      "/v1/teams/?category=5f8d04f7b32764421a7156df"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Category with this id does not exist",
    });
  });

  // GET /teams/?event=:eventId&category=:categoryId
  it("Should return a list of teams for event and category", async () => {
    const res = await request(app).get(
      "/v1/teams/?event=5f8d04b3b54764421b7156dc&category=5f8d04f7b54764421b7156dd"
    );

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(83);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      name: expect.any(String),
      participants: expect.any(Array),
      event: expect.any(String),
      category: expect.any(Object),
      extraMapRequired: expect.any(Boolean),
      routes: expect.any(Array),
    });
  });

  // GET /teams/:id
  it("Should successfully return a team by id", async () => {
    const res = await request(app).get("/v1/teams/5f90acf8b54764421b7160d7");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f90acf8b54764421b7160d7",
      name: "Deep fast argue",
      participants: expect.any(Array),
      event: "5f8d04b3b54764421b7156dc",
      category: expect.any(Object),
      extraMapRequired: false,
      routes: expect.any(Array),
    });
    expect(res.body.participants.length).toBe(3);
    expect(res.body.participants[0]).toMatchObject({
      _id: "5f8d0d55b54764421b715bca",
      name: { first: "James", last: "Boyd" },
      birthday: "1907-02-10T00:00:00.000Z",
      phone: "+79576149141",
      email: "kaiserelizabeth@yahoo.com",
    });
    expect(res.body.category).toMatchObject({
      _id: "5f8d04f7b54764421b7156e2",
      name: {
        short: "VL",
        long: "Velo-Ligero",
      },
      participantsNumber: {
        min: 3,
        max: 8,
      },
    });
    expect(res.body.routes[0]).toMatchObject({
      _id: "5fd550a7b547649dd7e376f9",
      actions: expect.any(Array),
      start: "2020-09-26T09:17:28.000Z",
      finish: "2020-09-26T13:06:44.000Z",
      tagAssignment: "5fcc1bd5b54764851111840d",
    });
    expect(res.body.routes[0].actions.length).toBe(10);
    expect(res.body.routes[0].actions[0]).toMatchObject({
      station: "5f8f8c44b54764421b715f4c",
      timestamp: "2020-09-26T09:28:34.000Z",
    });
  });

  it("Should return 400 if team id is invalid", async () => {
    const res = await request(app).get("/v1/teams/5f90acf8b54421b716d7");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f90acf8b54421b716d7' is not a valid object id",
    });
  });

  it("Should return 404 if team id does not exist", async () => {
    const res = await request(app).get("/v1/teams/5f90acf8b54764421b7150b7");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Team with this id does not exist",
    });
  });

  // POST /teams/
  it("Should return 405 if post is not allowed to update teams", async () => {
    const res = await request(app).post("/v1/teams/5f90acf8b54764421b7160e4");
    expect(res.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Method is not allowed. Check the API documentation",
    });
  });

  it("Should return 400 if creating a team without data", async () => {
    const res = await request(app).post("/v1/teams/").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Empty request body is received",
    });
  });

  it("Should return 201 if successfully created a team", async () => {
    const res = await request(app)
      .post("/v1/teams/")
      .send({
        name: "Huge Rainbow",
        participants: ["5f8d0d55b54764421b715bed", "5f8d0d55b54764421b715bee"],
        event: "5f8d0401b54764421b7156da",
        category: "5f8d04f7b54764421b7156e1",
      });
    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
    // regex for response like /teams/5f8d0d55b54764421b715d5d
    expect(res.headers.location).toMatch(/.*(\/v1\/teams\/)([a-f\d]{24})$/);
    expect(res.body).toMatchObject({
      name: "Huge Rainbow",
      participants: ["5f8d0d55b54764421b715bed", "5f8d0d55b54764421b715bee"],
      event: "5f8d0401b54764421b7156da",
      category: "5f8d04f7b54764421b7156e1",
      extraMapRequired: false,
    });
  });

  it("Should return 400 if team with the same name already exists for this event", async () => {
    const res = await request(app)
      .post("/v1/teams/")
      .send({
        name: "Eye describe attention",
        participants: ["5f8d0d55b54764421b715e00", "5f8d0d55b54764421b715e01"],
        event: "5f8d04b3b54764421b7156dc",
        category: "5f8d04f7b54764421b7156e1",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "E11000 duplicate key error dup key: " +
        '{ : "Eye describe attention"' +
        ", : ObjectId('5f8d04b3b54764421b7156dc') }",
    });
  });

  it("Should return 400 if team is larger than allowed in cateogry", async () => {
    const res = await request(app)
      .post("/v1/teams/")
      .send({
        name: "Very big team",
        participants: [
          "5f8d0d55b54764421b715c12",
          "5f8d0d55b54764421b715c13",
          "5f8d0d55b54764421b715c16",
        ],
        event: "5f8d04b3b54764421b7156dc",
        category: "5f8d04f7b54764421b7156df",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "The team does not have a valid number of participants. " +
        "Check participant limits for this category",
    });
  });

  it("Should return 400 if team is smaller than allowed in cateogry", async () => {
    const res = await request(app)
      .post("/v1/teams/")
      .send({
        name: "Very small team",
        participants: ["5f8d0d55b54764421b715c12"],
        event: "5f8d04b3b54764421b7156dc",
        category: "5f8d04f7b54764421b7156df",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "The team does not have a valid number of participants. " +
        "Check participant limits for this category",
    });
  });

  it("Should return 400 if one of the participants is already included in another team", async () => {
    const res = await request(app)
      .post("/v1/teams/")
      .send({
        name: "Oh this sneaky team!",
        participants: ["5f8d0d55b54764421b715c34"],
        event: "5f8d04b3b54764421b7156dc",
        category: "5f8d04f7b54764421b7156de",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "The team shares participants with another team. " +
        "All participants must be unique within the same event.",
    });
  });

  it("Should return 400 when creating a team without name", async () => {
    const res = await request(app)
      .post("/v1/teams/")
      .send({
        participants: ["5f8d0d55b54764421b715c34"],
        event: "5f8d04b3b54764421b7156dc",
        category: "5f8d04f7b54764421b7156de",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Team validation failed: name: Team name is required",
    });
  });

  it("Should return 400 when creating a team without participants", async () => {
    const res = await request(app).post("/v1/teams/").send({
      name: "Oh this sneaky team!",
      event: "5f8d04b3b54764421b7156dc",
      category: "5f8d04f7b54764421b7156de",
    });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Team validation failed: participants: " +
        "Participants array cannot be empty",
    });
  });

  it("Should return 400 when creating a team without event", async () => {
    const res = await request(app)
      .post("/v1/teams/")
      .send({
        name: "Oh this sneaky team!",
        participants: ["5f8d0d55b54764421b715c34"],
        category: "5f8d04f7b54764421b7156de",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Team validation failed: event: Event id is required",
    });
  });

  it("Should return 400 when creating a team without category", async () => {
    const res = await request(app)
      .post("/v1/teams/")
      .send({
        name: "Oh this sneaky team!",
        participants: ["5f8d0d55b54764421b715c34"],
        event: "5f8d04b3b54764421b7156dc",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Team validation failed: category: Category id is required",
    });
  });

  // PATCH /teams/:id
  it("Should return 400 when updating a team with invalid id", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f9af8b54764421b7161")
      .send({
        name: "New cool team name",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f9af8b54764421b7161' is not a valid object id",
    });
  });

  it("Should return 404 when updating a team with inexistent id", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf7b54164421b716101")
      .send({
        name: "New cool team name",
      });

    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Team with this id does not exist",
    });
  });

  it("Should return 200 when successfully updated team name", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf8b54764421b716108")
      .send({
        name: "New cool team name",
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f90acf8b54764421b716108",
      name: "New cool team name",
      participants: [
        "5f8d0d55b54764421b715c4e",
        "5f8d0d55b54764421b715c4f",
        "5f8d0d55b54764421b715c50",
      ],
      event: "5f8d04b3b54764421b7156dc",
      category: "5f8d04f7b54764421b7156e3",
    });
  });

  it("Should return 200 when successfully updated team participants", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf8b54764421b716102")
      .send({
        participants: [
          "5f8d0d55b54764421b715c39",
          "5f8d0d55b54764421b715c3a",
          "5f8d0d55b54764421b715c3b",
          "5f8d0d55b54764421b715c3c",
        ],
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f90acf8b54764421b716102",
      name: "By president",
      participants: [
        "5f8d0d55b54764421b715c39",
        "5f8d0d55b54764421b715c3a",
        "5f8d0d55b54764421b715c3b",
        "5f8d0d55b54764421b715c3c",
      ],
      event: "5f8d04b3b54764421b7156dc",
      category: "5f8d04f7b54764421b7156e1",
    });
  });

  it("Should return 200 when successfully updated team event", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf8b54764421b7160fb")
      .send({
        event: "5f8d0401b54764421b7156da",
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f90acf8b54764421b7160fb",
      name: "Entire together",
      participants: ["5f8d0d55b54764421b715c2a", "5f8d0d55b54764421b715c2b"],
      event: "5f8d0401b54764421b7156da",
      category: "5f8d04f7b54764421b7156df",
    });
  });

  it("Should return 200 when successfully updated team category", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf8b54764421b7160fa")
      .send({
        category: "5f8d04f7b54764421b7156e2",
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f90acf8b54764421b7160fa",
      name: "Water north serious",
      participants: [
        "5f8d0d55b54764421b715c26",
        "5f8d0d55b54764421b715c27",
        "5f8d0d55b54764421b715c28",
        "5f8d0d55b54764421b715c29",
      ],
      event: "5f8d04b3b54764421b7156dc",
      category: "5f8d04f7b54764421b7156e2",
    });
  });

  it("Should return 400 when updating team with invalid event", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf8b54764421b716102")
      .send({
        event: "5f8d0401476421b7156da",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Team validation failed: event: " +
        'Cast to ObjectId failed for value "5f8d0401476421b7156da" ' +
        'at path "event"',
    });
  });

  it("Should return 400 when updating team with invalid category", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf8b54764421b716102")
      .send({
        category: "5f8d04b5476441b7156e2",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Team validation failed: category: " +
        'Cast to ObjectId failed for value "5f8d04b5476441b7156e2" ' +
        'at path "category"',
    });
  });

  it("Should return 400 when updating team with inexistent event", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf8b54764421b716102")
      .send({
        event: "5f8d0401b54764231a7156da",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Event with this id does not exist",
    });
  });

  it("Should return 400 when updating team with inexistent category", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf8b54764421b716102")
      .send({
        category: "5f8d04f7b54713421b6156e2",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Category with this id does not exist",
    });
  });

  it("Should return 400 when updating team name that already exists", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf8b54764421b716102")
      .send({
        name: "Of character money",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "E11000 duplicate key error dup key: " +
        "{ : \"Of character money\", : ObjectId('5f8d04b3b54764421b7156dc') }",
    });
  });

  it("Should return 200 when updating team name that already exists in the previous event", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf8b54764421b716103")
      .send({
        name: "Sample Old",
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f90acf8b54764421b716103",
      name: "Sample Old",
      participants: [
        "5f8d0d55b54764421b715c3e",
        "5f8d0d55b54764421b715c3f",
        "5f8d0d55b54764421b715c40",
      ],
      event: "5f8d04b3b54764421b7156dc",
      category: "5f8d04f7b54764421b7156e3",
    });
  });

  it("Should return 400 when updating team participants above/beyond limits in the category", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf8b54764421b716102")
      .send({
        participants: ["5f8d0d55b54764421b715c39"],
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "The team does not have a valid number of participants. " +
        "Check participant limits for this category",
    });
  });

  it("Should return 400 when updated team category has lower number of participants", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf8b54764421b716102")
      .send({
        category: "5f8d04f7b54764421b7156de",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "The team does not have a valid number of participants. " +
        "Check participant limits for this category",
    });
  });

  it("Should return 400 when paid amount is not a number", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf8b54764421b716102")
      .send({
        amountPaid: "NotANumber",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Team validation failed: amountPaid: " +
        'Cast to Number failed for value "NotANumber" at path "amountPaid"',
    });
  });

  it("Should return 400 when paid amount is negative", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf8b54764421b716102")
      .send({
        amountPaid: -15,
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Team validation failed: amountPaid: -15 must not be negative",
    });
  });

  it("Should return 200 when successfully updated the amount paid", async () => {
    const res = await request(app)
      .patch("/v1/teams/5f90acf8b54764421b716139")
      .send({
        amountPaid: 1300,
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f90acf8b54764421b716139",
      name: "Study group gun",
      participants: [
        "5f8d0d55b54764421b715cbd",
        "5f8d0d55b54764421b715cbe",
        "5f8d0d55b54764421b715cbf",
      ],
      event: "5f8d04b3b54764421b7156dc",
      category: "5f8d04f7b54764421b7156e1",
      amountPaid: 1300,
    });
  });

  // DELETE /teams/:id
  it("Should return 400 when deleting team with invalid id", async () => {
    const res = await request(app).delete("/v1/teams/5f90acf8b54764421162");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f90acf8b54764421162' is not a valid object id",
    });
  });

  it("Should return 404 when deleting team with inexistent id", async () => {
    const res = await request(app).delete("/v1/teams/5f90acf8b54764321c726130");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Team with this id does not exist",
    });
  });

  it("Should return 200 when successfully deleted team by id", async () => {
    const res = await request(app).delete("/v1/teams/5f90acf8b54764421b716130");
    expect(res.status).toEqual(StatusCodes.NO_CONTENT);
    expect(res.type).toBe("");
  });

  it("Should return 404 when deleting the same team twice", async () => {
    await request(app).delete("/v1/teams/5f90acf8b54764421b71613a");
    const res = await request(app).delete("/v1/teams/5f90acf8b54764421b71613a");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Team with this id does not exist",
    });
  });

  // GET /teams/:id/participants
  it("Should return 400 when requesting participants of a team with invalid id", async () => {
    const res = await request(app).get("/v1/teams/5f90a51b716138/participants");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f90a51b716138' is not a valid object id",
    });
  });

  it("Should return 404 when requesting participants of a team with inexistent id", async () => {
    const res = await request(app).get(
      "/v1/teams/5f90acf8b54764321b726738/participants"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Team with this id does not exist",
    });
  });

  it("Should return a list of participants for team", async () => {
    const res = await request(app).get(
      "/v1/teams/5f90acf8b54764421b716138/participants"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(2);
    expect(res.body).toMatchObject([
      {
        _id: "5f8d0d55b54764421b715cbb",
        name: { first: "Brandon", last: "Hernandez" },
        birthday: new Date("2018-11-25").toISOString(),
        phone: "+79472875350",
        email: "evandoyle@brown-mcknight.biz",
      },
      {
        _id: "5f8d0d55b54764421b715cbc",
        name: { first: "Sara", last: "Hunt" },
        birthday: new Date("1970-06-22").toISOString(),
        phone: "+79145264011",
        email: "lauralyons@joseph-barnett.com",
      },
    ]);
  });

  it("Should return 400 when requesting team's route by invalid id", async () => {
    const res = await request(app).get("/v1/teams/5f90a51b716138/route");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f90a51b716138' is not a valid object id",
    });
  });

  it("Should return 400 when requesting team's water route by invalid id", async () => {
    const res = await request(app).get("/v1/teams/5f90a51b716138/route-water");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f90a51b716138' is not a valid object id",
    });
  });

  it("Should return 404 when requesting team's route by inexistent id", async () => {
    const res = await request(app).get(
      "/v1/teams/5f90acf8b54764321b616142/route"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Team with this id does not exist",
    });
  });

  it("Should return 404 when requesting team's water route by inexistent id", async () => {
    const res = await request(app).get(
      "/v1/teams/5f90acf8b54764321b616142/route-water"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Team with this id does not exist",
    });
  });

  it("Should return 200 when requesting a team's route", async () => {
    const res = await request(app).get(
      "/v1/teams/5f90acf8b54764421b71612f/route"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject([
      {
        _id: "5fd550a7b547649dd7e37779",
        tagAssignment: "5fcc1bd5b54764851111848c",
        start: new Date(1601104882000).toISOString(),
        finish: new Date(1601132884000).toISOString(),
        actions: expect.any(Array),
      },
      {
        _id: "5fd550a7b547649dd7e3777a",
        tagAssignment: "5fcc1bd5b54764851111848d",
        start: new Date(1601104871000).toISOString(),
        finish: new Date(1601132881000).toISOString(),
        actions: expect.any(Array),
      },
    ]);
  });

  it("Should return 200 when requesting a team's water route", async () => {
    const res = await request(app).get(
      "/v1/teams/5f90acf8b54764421b71610f/route-water"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5fcc1e2fb547648511118544",
      team: "5f90acf8b54764421b71610f",
      start: new Date("2020-09-27T11:33:00").toISOString(),
      actions: expect.any(Array),
    });
  });
});
