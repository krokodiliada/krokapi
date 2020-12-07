import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import { populateSampleDatabase, eraseSampleDatabase } from "../utils/sampledb";

describe("Checkpoint Assignment endpoints", () => {
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

  // GET /checkpoint-assignments/
  it("Should return a list of all assignments", async () => {
    const res = await request(app).get("/checkpoint-assignments/");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBeGreaterThan(80);
    expect(res.body.length).toBeLessThan(85);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      krok: expect.any(String),
      category: expect.any(String),
      checkpoint: expect.any(String),
      station: expect.any(String),
      required: expect.any(Boolean),
      checkOrder: expect.any(Boolean),
    });
  });

  // GET /checkpoint-assignments/:id
  it("Should return 400 if requesting assignment by invalid id", async () => {
    const res = await request(app).get("/checkpoint-assignments/585476b7160a4");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if requesting assignment by invalid id", async () => {
    const res = await request(app).get(
      "/checkpoint-assignments/5f907c38b54754321a7160a4"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if requesting assignment by invalid id", async () => {
    const res = await request(app).get(
      "/checkpoint-assignments/5f907c38b54764421b7160a4"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f907c38b54764421b7160a4",
      krok: "5f8d04b3b54764421b7156dc",
      category: "5f8d04f7b54764421b7156df",
      checkpoint: "5f8f8720b54764421b715f24",
      station: "5f8f8c44b54764421b715f54",
      required: true,
      checkOrder: true,
      order: 4,
    });
  });

  // POST /checkpoint-assignments/
  it("Should return 400 if creating assignment with empty body", async () => {
    const res = await request(app).post("/checkpoint-assignments/").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating assignment without krok", async () => {
    const res = await request(app).post("/checkpoint-assignments/").send({
      category: "5f8d04f7b54764421b7156df",
      checkpoint: "5f8f8720b54764421b715f21",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating assignment without category", async () => {
    const res = await request(app).post("/checkpoint-assignments/").send({
      krok: "5f8d0401b54764421b7156da",
      checkpoint: "5f8f8720b54764421b715f21",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating assignment without checkpoint", async () => {
    const res = await request(app).post("/checkpoint-assignments/").send({
      krok: "5f8d0401b54764421b7156da",
      category: "5f8d04f7b54764421b7156df",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 201 if successfully created assignment", async () => {
    const res = await request(app).post("/checkpoint-assignments/").send({
      krok: "5f8d0401b54764421b7156da",
      category: "5f8d04f7b54764421b7156df",
      checkpoint: "5f8f8720b54764421b715f21",
    });
    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
    expect(res.headers.location).toMatch("/.*(/checkpoint-assignments/(.+))$");
  });

  // DELETE /checkpoint-assignments/:id
  it("Should return 400 if deleting assignment by invalid id", async () => {
    const res = await request(app).delete(
      "/checkpoint-assignments/5f907c387644b716095"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if deleting assignment by invalid id", async () => {
    const res = await request(app).delete(
      "/checkpoint-assignments/5f907c38b54724421a715095"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if successfully deleted assignment by id", async () => {
    const res = await request(app).delete(
      "/checkpoint-assignments/5f907c38b54764421b716095"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if trying to delete the same assignment twice", async () => {
    await request(app).delete(
      "/checkpoint-assignments/5f907c38b54764421b716092"
    );
    const res = await request(app).delete(
      "/checkpoint-assignments/5f907c38b54764421b716092"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });
});
