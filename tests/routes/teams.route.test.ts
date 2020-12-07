import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import { populateSampleDatabase, eraseSampleDatabase } from "../utils/sampledb";

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
    mongoose.connection.close();
  });

  // GET methods

  // GET /teams/?krok=:id
  it("Should return a list of all teams for specific krok", async () => {
    const res = await request(app).get("/teams/?krok=5f8d0401b54764421b7156da");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toMatchObject({
      _id: "5f90acf8b54764421a729193",
      name: "Sample Old",
      participants: ["5f8d0d55b54764421b715d99"],
      krok: "5f8d0401b54764421b7156da",
      category: "5f8d04f7b54764421b7156de",
      extraMapRequired: false,
    });
  });

  it("Should return 400 if krok filter is invalid", async () => {
    const res = await request(app).get("/teams/?krok=5f8d0401b547641b71da");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if krok number does not exist", async () => {
    const res = await request(app).get("/teams/?krok=5f8d0401b54764421a7136da");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(0);
  });

  // GET /teams/?category=:categoryId
  it("Should return a list of all teams for specific category", async () => {
    const res = await request(app).get(
      "/teams/?category=5f8d04f7b54764421b7156df"
    );

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(25);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      name: expect.any(String),
      participants: expect.any(Array),
      krok: expect.any(String),
      category: expect.any(String),
      extraMapRequired: expect.any(Boolean),
    });
  });

  it("Should return 400 if category filter is invalid", async () => {
    const res = await request(app).get("/teams/?category=5f84f7b5476442156df");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if category id does not exist", async () => {
    const res = await request(app).get(
      "/teams/?category=5f8d04f7b32764421a7156df"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(0);
  });

  // GET /teams/?krok=:number&category=:categoryId
  it("Should return a list of teams for krok and category", async () => {
    const res = await request(app).get(
      "/teams/?krok=50&category=5f8d04f7b54764421b7156dd"
    );

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(83);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      name: expect.any(String),
      participants: expect.any(Array),
      krok: expect.any(String),
      category: expect.any(String),
      extraMapRequired: expect.any(Boolean),
    });
  });

  // GET /teams/:id
  it("Should successfully return a team by id", async () => {
    const res = await request(app).get("/teams/5f90acf8b54764421b7160d7");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body[0]).toMatchObject({
      _id: "5f90acf8b54764421b7160d7",
      name: "Deep fast argue",
      participants: [
        "5f8d0d55b54764421b715bca",
        "5f8d0d55b54764421b715bcb",
        "5f8d0d55b54764421b715bcc",
      ],
      krok: "5f8d04b3b54764421b7156dc",
      category: "5f8d04f7b54764421b7156e2",
      extraMapRequired: false,
    });
  });

  it("Should return 400 if team id is invalid", async () => {
    const res = await request(app).get("/teams/5f90acf8b54421b716d7");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if team id does not exist", async () => {
    const res = await request(app).get("/teams/5f90acf8b54764421b7150b7");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // POST /teams/
  it("Should return 405 if post is not allowed to update teams", async () => {
    const res = await request(app).post("/teams/5f90acf8b54764421b7160e4");
    expect(res.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating a team without data", async () => {
    const res = await request(app).post("/teams/").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 201 if successfully created a team", async () => {
    const res = await request(app)
      .post("/teams/")
      .send({
        name: "Huge Rainbow",
        participants: ["5f8d0d55b54764421b715bed", "5f8d0d55b54764421b715bee"],
        krok: "5f8d0401b54764421b7156da",
        category: "5f8d04f7b54764421b7156e2",
      });
    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
    // regex for response like /teams/5f8d0d55b54764421b715d5d
    expect(res.headers.location).toMatch(/.*(\/teams\/)([a-f\d]{24})$/);
  });

  it("Should return 400 if team with the same name already exists for this krok", async () => {
    const res = await request(app)
      .post("/teams/")
      .send({
        name: "Eye describe attention",
        participants: ["5f8d0d55b54764421b715bf9", "5f8d0d55b54764421b715bfa"],
        krok: "5f8d04b3b54764421b7156dc",
        category: "5f8d04f7b54764421b7156e3",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if team is larger than allowed in cateogry", async () => {
    const res = await request(app)
      .post("/teams/")
      .send({
        name: "Very big team",
        participants: [
          "5f8d0d55b54764421b715c12",
          "5f8d0d55b54764421b715c13",
          "5f8d0d55b54764421b715c16",
        ],
        krok: "5f8d04b3b54764421b7156dc",
        category: "5f8d04f7b54764421b7156df",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if team is smaller than allowed in cateogry", async () => {
    const res = await request(app)
      .post("/teams/")
      .send({
        name: "Very small team",
        participants: ["5f8d0d55b54764421b715c12"],
        krok: "5f8d04b3b54764421b7156dc",
        category: "5f8d04f7b54764421b7156df",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if one of the participants is already included in another team", async () => {
    const res = await request(app)
      .post("/teams/")
      .send({
        name: "Oh this sneaky team!",
        participants: ["5f8d0d55b54764421b715c34"],
        krok: "5f8d04b3b54764421b7156dc",
        category: "5f8d04f7b54764421b7156de",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when creating a team without name", async () => {
    const res = await request(app)
      .post("/teams/")
      .send({
        participants: ["5f8d0d55b54764421b715c34"],
        krok: "5f8d04b3b54764421b7156dc",
        category: "5f8d04f7b54764421b7156de",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when creating a team without participants", async () => {
    const res = await request(app).post("/teams/").send({
      name: "Oh this sneaky team!",
      krok: "5f8d04b3b54764421b7156dc",
      category: "5f8d04f7b54764421b7156de",
    });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when creating a team without krok", async () => {
    const res = await request(app)
      .post("/teams/")
      .send({
        name: "Oh this sneaky team!",
        participants: ["5f8d0d55b54764421b715c34"],
        category: "5f8d04f7b54764421b7156de",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when creating a team without category", async () => {
    const res = await request(app)
      .post("/teams/")
      .send({
        name: "Oh this sneaky team!",
        participants: ["5f8d0d55b54764421b715c34"],
        krok: "5f8d04b3b54764421b7156dc",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  // PATCH /teams/:id
  it("Should return 400 when updating a team with invalid id", async () => {
    const res = await request(app).patch("/teams/5f9af8b54764421b7161").send({
      name: "New cool team name",
    });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when updating a team with inexistent id", async () => {
    const res = await request(app)
      .patch("/teams/5f90acf7b54164421b716101")
      .send({
        name: "New cool team name",
      });

    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when successfully updated team name", async () => {
    const res = await request(app)
      .patch("/teams/5f90acf8b54764421b716102")
      .send({
        name: "New cool team name",
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when successfully updated team participants", async () => {
    const res = await request(app)
      .patch("/teams/5f90acf8b54764421b716102")
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
  });

  it("Should return 200 when successfully updated team krok", async () => {
    const res = await request(app)
      .patch("/teams/5f90acf8b54764421b716102")
      .send({
        krok: "5f8d0401b54764421b7156da",
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when successfully updated team category", async () => {
    const res = await request(app)
      .patch("/teams/5f90acf8b54764421b716102")
      .send({
        category: "5f8d04f7b54764421b7156e2",
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when updating team with invalid krok", async () => {
    const res = await request(app)
      .patch("/teams/5f90acf8b54764421b716102")
      .send({
        krok: "5f8d0401476421b7156da",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when updating team with invalid category", async () => {
    const res = await request(app)
      .patch("/teams/5f90acf8b54764421b716102")
      .send({
        category: "5f8d04b5476441b7156e2",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when updating team with invalid name", async () => {
    const res = await request(app)
      .patch("/teams/5f90acf8b54764421b716102")
      .send({
        name: 15,
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when updating team with inexistent krok", async () => {
    const res = await request(app)
      .patch("/teams/5f90acf8b54764421b716102")
      .send({
        krok: "5f8d0401b54764231a7156da",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when updating team with inexistent category", async () => {
    const res = await request(app)
      .patch("/teams/5f90acf8b54764421b716102")
      .send({
        category: "5f8d04f7b54713421b6156e2",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when updating team name that already exists", async () => {
    const res = await request(app)
      .patch("/teams/5f90acf8b54764421b716102")
      .send({
        name: "Of character money",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when updating team name that already exists in the previous krok", async () => {
    const res = await request(app)
      .patch("/teams/5f90acf8b54764421b716102")
      .send({
        name: "Sample Old",
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when updating team participants above/beyond limits in the category", async () => {
    const res = await request(app)
      .patch("/teams/5f90acf8b54764421b716102")
      .send({
        participants: ["5f8d0d55b54764421b715c39"],
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when updated team category has lower number of participants", async () => {
    const res = await request(app)
      .patch("/teams/5f90acf8b54764421b716102")
      .send({
        category: "5f8d04f7b54764421b7156de",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  // DELETE /teams/:id
  it("Should return 400 when deleting team with invalid id", async () => {
    const res = await request(app).delete("/teams/5f90acf8b54764421162");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when deleting team with inexistent id", async () => {
    const res = await request(app).delete("/teams/5f90acf8b54764321c726130");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when successfully deleted team by id", async () => {
    const res = await request(app).delete("/teams/5f90acf8b54764421b716130");
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when deleting the same team twice", async () => {
    await request(app).delete("/teams/5f90acf8b54764421b71613a");
    const res = await request(app).delete("/teams/5f90acf8b54764421b71613a");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // GET /teams/:id/participants
  it("Should return 400 when requesting participants of a team with invalid id", async () => {
    const res = await request(app).get("/teams/5f90a51b716138/participants");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when requesting participants of a team with inexistent id", async () => {
    const res = await request(app).get(
      "/teams/5f90acf8b54764321b726738/participants"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return a list of participants for team", async () => {
    const res = await request(app).get(
      "/teams/5f90acf8b54764421b716138/participants"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(2);
    expect(res.body).toMatchObject({
      participants: [
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
      ],
    });
  });

  it("Should return 400 when requesting team's route by invalid id", async () => {
    const res = await request(app).get("/teams/5f90a51b716138/route");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when requesting team's water route by invalid id", async () => {
    const res = await request(app).get("/teams/5f90a51b716138/route-water");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when requesting team's route by inexistent id", async () => {
    const res = await request(app).get("/teams/5f90acf8b54764321b616142/route");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when requesting team's water route by inexistent id", async () => {
    const res = await request(app).get(
      "/teams/5f90acf8b54764321b616142/route-water"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when requesting a team's route", async () => {
    const res = await request(app).get("/teams/5f90acf8b54764421b71612f/route");
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(2);
    expect(res.body).toMatchObject({
      route: [
        {
          tag: "",
          krok: "",
          start: new Date("Sep 26, 2020 10:36:58").toISOString(),
          finish: new Date("Sep 26, 2020 18:36:58").toISOString(),
          actions: [],
        },
        {},
      ],
    });
  });

  it("Should return 200 when requesting a team's water route", async () => {
    const res = await request(app).get(
      "/teams/5f90acf8b54764421b71612f/route-water"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(2);
    expect(res.body).toMatchObject({
      route: [
        {
          tag: "",
          krok: "",
          start: new Date("Sep 27, 2020 10:36:58").toISOString(),
          finish: new Date("Sep 27, 2020 10:38:58").toISOString(),
          actions: [],
        },
      ],
    });
  });
});
