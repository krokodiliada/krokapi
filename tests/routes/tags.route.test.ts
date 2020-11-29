import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import { populateSampleDatabase, eraseSampleDatabase } from "../utils/sampledb";

describe("Tag endpoints", () => {
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

  // GET /tags/
  it("Should return a list of all tags", async () => {
    const res = await request(app).get("/tags/");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBeGreaterThan(1);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      number: expect.any(Number),
      enabled: expect.any(Boolean),
    });
  });

  // GET /tags/:tag
  it("Should return a tag by number and status 200", async () => {
    const res = await request(app).get("/tags/99");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBeGreaterThan(1);
    expect(res.body[0]).toMatchObject({
      _id: "5f8e2d30b54764421b715dfc",
      number: 99,
      enabled: true,
    });
  });

  it("Should return 400 when requesting tag with invalid number", async () => {
    const res = await request(app).get("/tags/505Aaab");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when requesting inexistent tag", async () => {
    const res = await request(app).get("/tags/40012");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // DELETE /tags/:tag
  it("Should return 400 when deleting tag with invalid number", async () => {
    const res = await request(app).delete("/tags/505Aaab");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when deleting inexistent tag", async () => {
    const res = await request(app).delete("/tags/40012");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when successfully deleted tag", async () => {
    const res = await request(app).delete("/tags/13");
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when deleting tag for the second time", async () => {
    await request(app).delete("/tags/15");
    const res = await request(app).delete("/tags/15");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // PUT /tags/:tag
  it("Should return 400 when adding tag with invalid number", async () => {
    const res = await request(app).put("/tags/505Aaab");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when adding tag with number only", async () => {
    const res = await request(app).put("/tags/515");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: expect.any(String),
      number: 515,
      enabled: true,
    });
  });

  it("Should return 200 when adding tag with number and state", async () => {
    const res = await request(app).put("/tags/516").send({
      enabled: false,
    });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: expect.any(String),
      number: 516,
      enabled: false,
    });
  });

  // PATCH /tags/:tag
  it("Should return 400 when updating tag with invalid number", async () => {
    const res = await request(app).patch("/tags/515Aab");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when updating tag without data", async () => {
    const res = await request(app).patch("/tags/29").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when updating inexistent tag", async () => {
    const res = await request(app).patch("/tags/900");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when successfully updated tag", async () => {
    const res = await request(app).patch("/tags/29").send({
      enbled: false,
    });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });
});
