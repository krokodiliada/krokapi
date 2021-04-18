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
    expect(res.body.length).toBeGreaterThan(45);
    expect(res.body.length).toBeLessThan(50);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      name: expect.any(String),
      water: expect.any(Boolean),
    });
  });

  it("Should return 400 if requestion checkpoint by invalid id", async () => {
    const res = await request(app).get("/v1/checkpoints/5f8f87205474421b7151c");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if requestion checkpoint by inexistent id", async () => {
    const res = await request(app).get(
      "/v1/checkpoints/5f8f8720b54764321a615f1c"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // GET /checkpoints/:id
  it("Should return a checkpoint by id", async () => {
    const res = await request(app).get(
      "/v1/checkpoints/5f8f8720b54764421b715f1c"
    );

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8f8720b54764421b715f1c",
      name: "Son prevent who",
      location: "5f8f83f6b54764421b715ef9",
      water: false,
    });
  });

  // POST /checkpoints/
  it("Should return 400 if creating checkpoint without body", async () => {
    const res = await request(app).post("/v1/checkpoints/").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating checkpoint without name", async () => {
    const res = await request(app).post("/v1/checkpoints/").send({
      location: "5f8f83f6b54764421b715f0d",
      description: "Some long description",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating checkpoint with location that already used", async () => {
    const res = await request(app).post("/v1/checkpoints/").send({
      name: "Duplicated location",
      location: "5f8f83f6b54764421b715f07",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 201 if successfully created checkpoint", async () => {
    const res = await request(app).post("/v1/checkpoints/").send({
      name: "Duplicated location",
      location: "5f8f83f6b54764421b715f0d",
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
      "/v1/checkpoints/5f8f80b547644215f33"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if deleting checkpoint by inexistent id", async () => {
    const res = await request(app).delete(
      "/v1/checkpoints/5f8f8720a54763421b714f33"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if successfully deleted checkpoint", async () => {
    const res = await request(app).delete(
      "/v1/checkpoints/5f8f8720b54764421b715f33"
    );
    expect(res.status).toEqual(StatusCodes.NO_CONTENT);
    expect(res.type).toBe("");
  });

  it("Should return 404 if trying to delete the same checkpoint twice", async () => {
    await request(app).delete("/v1/checkpoints/5f8f8720b54764421b715f23");
    const res = await request(app).delete(
      "/v1/checkpoints/5f8f8720b54764421b715f23"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // PATCH /checkpoints/:id
  it("Should return 400 if updating checkpoint by invalid id", async () => {
    const res = await request(app).patch("/v1/checkpoints/5f8f80b547644215f33");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if updating checkpoint by inexistent id", async () => {
    const res = await request(app).patch(
      "/v1/checkpoints/5f8f8710b54764321b415f33"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if setting location that is already used", async () => {
    const res = await request(app)
      .patch("/v1/checkpoints/5f8f8720b54764421b715f1f")
      .send({
        location: "5f8f83f6b54764421b715efe",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if successfully updated checkpoint", async () => {
    const res = await request(app)
      .patch("/v1/checkpoints/5f8f8720b54764421b715f1d")
      .send({
        name: "New updated name",
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8f8720b54764421b715f1d",
      name: "New updated name",
      location: "5f8f83f6b54764421b715efa",
    });
  });
});
