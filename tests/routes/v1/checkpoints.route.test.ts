import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import {
  populateSampleDatabase,
  eraseSampleDatabase,
} from "../../utils/sampledb";

describe("Checkpoint endpoints", () => {
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

  // GET /checkpoints/
  it("Should return a list of all checkpoints", async () => {
    const res = await request(app).get("/v1/checkpoints/");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBeGreaterThan(80);
    expect(res.body.length).toBeLessThan(85);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      event: expect.any(String),
      category: expect.any(String),
      location: expect.any(String),
      station: expect.any(String),
      required: expect.any(Boolean),
      checkOrder: expect.any(Boolean),
    });
  });

  // GET /checkpoints/:id
  it("Should return 400 if requesting checkpoint by invalid id", async () => {
    const res = await request(app).get("/v1/checkpoints/585476b7160a4");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'585476b7160a4' is not a valid object id",
    });
  });

  it("Should return 404 if requesting checkpoint by inexistent id", async () => {
    const res = await request(app).get(
      "/v1/checkpoints/5f907c38b54754321a7160a4"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Checkpoint with this id does not exist",
    });
  });

  it("Should return 200 if requesting checkpoint by id", async () => {
    const res = await request(app).get(
      "/v1/checkpoints/5f907c38b54764421b7160a4"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f907c38b54764421b7160a4",
      event: "5f8d04b3b54764421b7156dc",
      category: "5f8d04f7b54764421b7156df",
      location: "5f8f8720b54764421b715f24",
      station: "5f8f8c44b54764421b715f54",
      required: true,
      checkOrder: true,
      order: 4,
    });
  });

  // POST /checkpoints/
  it("Should return 400 if creating checkpoint with empty body", async () => {
    const res = await request(app).post("/v1/checkpoints/").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Checkpoint validation failed: " +
        "location: Location id is required, " +
        "category: Category id is required, " +
        "event: Event id is required",
    });
  });

  it("Should return 400 if creating checkpoint without event", async () => {
    const res = await request(app).post("/v1/checkpoints/").send({
      category: "5f8d04f7b54764421b7156df",
      location: "5f8f8720b54764421b715f21",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Checkpoint validation failed: event: Event id is required",
    });
  });

  it("Should return 400 if creating checkpoint without category", async () => {
    const res = await request(app).post("/v1/checkpoints/").send({
      event: "5f8d0401b54764421b7156da",
      location: "5f8f8720b54764421b715f21",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Checkpoint validation failed: category: Category id is required",
    });
  });

  it("Should return 400 if creating checkpoint without checkpoint", async () => {
    const res = await request(app).post("/v1/checkpoints/").send({
      event: "5f8d0401b54764421b7156da",
      category: "5f8d04f7b54764421b7156df",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Checkpoint validation failed: location: Location id is required",
    });
  });

  it("Should return 201 if successfully created checkpoint", async () => {
    const res = await request(app).post("/v1/checkpoints/").send({
      event: "5f8d0401b54764421b7156da",
      category: "5f8d04f7b54764421b7156df",
      location: "5f8f8720b54764421b715f21",
    });
    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
    expect(res.headers.location).toMatch(
      /.*(\/v1\/checkpoints\/)([a-f\d]{24})$/
    );
  });

  // DELETE /checkpoints/:id
  it("Should return 400 if deleting checkpoint by invalid id", async () => {
    const res = await request(app).delete(
      "/v1/checkpoints/5f907c387644b716095"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f907c387644b716095' is not a valid object id",
    });
  });

  it("Should return 404 if deleting checkpoint by invalid id", async () => {
    const res = await request(app).delete(
      "/v1/checkpoints/5f907c38b54724421a715095"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Checkpoint with this id does not exist",
    });
  });

  it("Should return 200 if successfully deleted checkpoint by id", async () => {
    const res = await request(app).delete(
      "/v1/checkpoints/5f907c38b54764421b716095"
    );
    expect(res.status).toEqual(StatusCodes.NO_CONTENT);
    expect(res.type).toBe("");
  });

  it("Should return 404 if trying to delete the same checkpoint twice", async () => {
    await request(app).delete("/v1/checkpoints/5f907c38b54764421b716092");
    const res = await request(app).delete(
      "/v1/checkpoints/5f907c38b54764421b716092"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Checkpoint with this id does not exist",
    });
  });
});
