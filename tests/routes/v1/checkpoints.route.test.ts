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

  it("[WRONG] Should return 400 if creating checkpoint with invalid event id", async () => {
    const res = await request(app).post("/v1/checkpoints/").send({
      event: "5f8d0401b521b7156da",
      category: "5f8d04f7b54764421b7156df",
      location: "5f8f8720b54764421b715f21",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    // expect(res.body).toMatchObject({
    //   error: "'5f8d0401b521b7156da' is not a valid event id",
    // });
  });

  it("[WRONG] Should return 400 if creating checkpoint with invalid category id", async () => {
    const res = await request(app).post("/v1/checkpoints/").send({
      event: "5f8d0401b54764421b7156da",
      category: "5f8d04f64421b7156df",
      location: "5f8f8720b54764421b715f21",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    // expect(res.body).toMatchObject({
    //   error: "'5f8d04f64421b7156df' is not a valid category id",
    // });
  });

  it("[WRONG] Should return 400 if creating checkpoint with invalid location id", async () => {
    const res = await request(app).post("/v1/checkpoints/").send({
      event: "5f8d0401b54764421b7156da",
      category: "5f8d04f7b54764421b7156df",
      location: "5f8f8720b521b715f21",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    // expect(res.body).toMatchObject({
    //   error: "'5f8f8720b521b715f21' is not a valid location id",
    // });
  });

  it("[WRONG] Should return 400 if creating checkpoint with inexistent event id", async () => {
    const res = await request(app).post("/v1/checkpoints/").send({
      event: "5f8d0401a54364422b7146da",
      category: "5f8d04f7b54764421b7156df",
      location: "5f8f8720b54764421b715f21",
    });
    // expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    // expect(res.type).toBe("application/json");
    // expect(res.body).toMatchObject({
    //   error: "Event with this id does not exist",
    // });
    expect(res.status).toEqual(StatusCodes.CREATED);
  });

  it("[WRONG] Should return 400 if creating checkpoint with inexistent category id", async () => {
    const res = await request(app).post("/v1/checkpoints/").send({
      event: "5f8d0401b54764421b7156da",
      category: "5f8d04c7b53764411d7156df",
      location: "5f8f8720b54764421b715f21",
    });
    // expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    // expect(res.type).toBe("application/json");
    // expect(res.body).toMatchObject({
    //   error: "Category with this id does not exist",
    // });
    expect(res.status).toEqual(StatusCodes.CREATED);
  });

  it("[WRONG] Should return 400 if creating checkpoint with inexistent location id", async () => {
    const res = await request(app).post("/v1/checkpoints/").send({
      event: "5f8d0401b54764421b7156da",
      category: "5f8d04f7b54764421b7156df",
      location: "5f8f8710b53764221a715f21",
    });
    // expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    // expect(res.type).toBe("application/json");
    // expect(res.body).toMatchObject({
    //   error: "Location with this id does not exist",
    // });
    expect(res.status).toEqual(StatusCodes.CREATED);
  });

  // PATCH /checkpoints/:id

  it("Should return 400 if updating checkpoint with no data", async () => {
    const res = await request(app)
      .patch("/v1/checkpoints/5f907c38b54764421b7160a0")
      .send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Empty request body is received",
    });
  });

  it("Should return 400 if updating checkpoint by invalid id", async () => {
    const res = await request(app)
      .patch("/v1/checkpoints/5f907c38b4764b7160a0")
      .send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f907c38b4764b7160a0' is not a valid object id",
    });
  });

  it("Should return 404 if updating checkpoint by inexistent id", async () => {
    const res = await request(app)
      .patch("/v1/checkpoints/5f907a34b54264421a7160a0")
      .send({});
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Checkpoint with this id does not exist",
    });
  });

  it("[WRONG] Should return 400 if updating checkpoint with invalid event id", async () => {
    const res = await request(app)
      .patch("/v1/checkpoints/5f907c38b54764421b7160a0")
      .send({
        event: "5f8d0401b521b7156da",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    // expect(res.body).toMatchObject({
    //   error: "'5f8d0401b521b7156da' is not a valid event id",
    // });
  });

  it("[WRONG] Should return 400 if updating checkpoint with invalid category id", async () => {
    const res = await request(app)
      .patch("/v1/checkpoints/5f907c38b54764421b7160a0")
      .send({
        category: "5f8d04f64421b7156df",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    // expect(res.body).toMatchObject({
    //   error: "'5f8d04f64421b7156df' is not a valid category id",
    // });
  });

  it("[WRONG] Should return 400 if updating checkpoint with invalid location id", async () => {
    const res = await request(app)
      .patch("/v1/checkpoints/5f907c38b54764421b7160a0")
      .send({
        location: "5f8f8720b521b715f21",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    // expect(res.body).toMatchObject({
    //   error: "'5f8f8720b521b715f21' is not a valid location id",
    // });
  });

  it("[WRONG] Should return 400 if updating checkpoint with inexistent event id", async () => {
    const res = await request(app)
      .patch("/v1/checkpoints/5f907c38b54764421b7160a0")
      .send({
        event: "5f8d0401a54364422b7146da",
      });
    // expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    // expect(res.type).toBe("application/json");
    // expect(res.body).toMatchObject({
    //   error: "Event with this id does not exist",
    // });
    expect(res.status).toEqual(StatusCodes.OK);
  });

  it("[WRONG] Should return 400 if updating checkpoint with inexistent category id", async () => {
    const res = await request(app)
      .patch("/v1/checkpoints/5f907c38b54764421b7160a0")
      .send({
        category: "5f8d04c7b53764411d7156df",
      });
    // expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    // expect(res.type).toBe("application/json");
    // expect(res.body).toMatchObject({
    //   error: "Category with this id does not exist",
    // });
    expect(res.status).toEqual(StatusCodes.OK);
  });

  it("[WRONG] Should return 400 if updating checkpoint with inexistent location id", async () => {
    const res = await request(app)
      .patch("/v1/checkpoints/5f907c38b54764421b7160a0")
      .send({
        location: "5f8f8710b53764221a715f21",
      });
    // expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    // expect(res.type).toBe("application/json");
    // expect(res.body).toMatchObject({
    //   error: "Location with this id does not exist",
    // });
    expect(res.status).toEqual(StatusCodes.OK);
  });

  it("Should return 200 if updated checkpoint's location successfully", async () => {
    const res = await request(app)
      .patch("/v1/checkpoints/5f907c38b54764421b71609c")
      .send({
        location: "5f8f8720b54764421b715f2c",
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f907c38b54764421b71609c",
      event: "5f8d04b3b54764421b7156dc",
      category: "5f8d04f7b54764421b7156e1",
      location: "5f8f8720b54764421b715f2c",
      station: "5f8f8c44b54764421b715f50",
      required: true,
      checkOrder: true,
      order: 1,
    });
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
