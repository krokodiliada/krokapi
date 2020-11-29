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
    const res = await request(app).get("/participant/5f8d0d55b54764421b715d8d");

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
    const res = await request(app).get("/participant/5f8d0d554421b715d8d");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if participant is not found", async () => {
    const res = await request(app).get("/participant/5f8d0d43b54764421b715d8d");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });
});
