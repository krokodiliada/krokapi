import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import { StationType } from "model/Station";
import { populateSampleDatabase, eraseSampleDatabase } from "../utils/sampledb";

describe("Station endpoints", () => {
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

  // GET /stations/
  it("Should return a list of all stations", async () => {
    const res = await request(app).get("/stations/");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBeGreaterThan(1);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      number: expect.any(Number),
      enabled: expect.any(Boolean),
    });
  });

  // GET /stations/:station
  it("Should return 200 when requesting a station by number", async () => {
    const res = await request(app).get("/stations/19");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8f8c44b54764421b715f4f",
      number: 19,
      enabled: true,
      stationType: StationType.Regular,
    });
  });

  it("Should return 400 when requesting station with invalid number", async () => {
    const res = await request(app).get("/stations/505Aaab");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when requesting inexistent station", async () => {
    const res = await request(app).get("/stations/40012");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // DELETE /stations/:station
  it("Should return 400 when deleting station with invalid number", async () => {
    const res = await request(app).delete("/stations/505Aaab");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when deleting inexistent station", async () => {
    const res = await request(app).delete("/stations/40012");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when successfully deleted station", async () => {
    const res = await request(app).delete("/stations/13");
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when deleting station for the second time", async () => {
    await request(app).delete("/stations/15");
    const res = await request(app).delete("/stations/15");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // PUT /stations/:station
  it("Should return 400 when adding station with invalid number", async () => {
    const res = await request(app).put("/stations/505Aaab");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 201 when adding station with number only", async () => {
    const res = await request(app).put("/stations/515");

    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: expect.any(String),
      number: 515,
      enabled: true,
    });
  });

  it("Should return 201 when adding station with number and data", async () => {
    const res = await request(app).put("/stations/516").send({
      stationType: StationType.Start,
    });

    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: expect.any(String),
      number: 516,
      enabled: true,
      stationType: StationType.Start,
    });
  });

  // PATCH /stations/:station
  it("Should return 400 when updating station with invalid number", async () => {
    const res = await request(app).patch("/stations/515Aab");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when updating inexistent station", async () => {
    const res = await request(app).patch("/stations/900");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when successfully updated station with status", async () => {
    const res = await request(app).patch("/stations/29").send({
      enbled: false,
    });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when successfully updated station with type", async () => {
    const res = await request(app).patch("/stations/30").send({
      stationType: StationType.Finish,
    });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when updated station with both status and type", async () => {
    const res = await request(app).patch("/stations/31").send({
      enbled: false,
      stationType: StationType.Clear,
    });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });
});
