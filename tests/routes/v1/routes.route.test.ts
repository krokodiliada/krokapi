import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import {
  populateSampleDatabase,
  eraseSampleDatabase,
} from "../../utils/sampledb";

describe("Route endpoints", () => {
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

  // GET /routes/
  it("Should return the list of all routes", async () => {
    const res = await request(app).get("/v1/routes/");
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBeGreaterThan(315);
    expect(res.body.length).toBeLessThan(325);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      tagAssignment: expect.any(String),
      actions: expect.any(Array),
      start: expect.any(String),
      finish: expect.any(String),
    });
  });

  // GET /routes/?tagAssignment=:tagAssignment
  it("Should return a single route by tag assignment id", async () => {
    const res = await request(app).get(
      "/v1/routes/?tagAssignment=5fcc1bd5b54764851111845b"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toMatchObject({
      _id: "5fd550a7b547649dd7e3781d",
      tagAssignment: "5fcc1bd5b54764851111845b",
      start: new Date(1601110021000).toISOString(),
      finish: new Date(1601149468000).toISOString(),
      actions: expect.any(Array),
    });
  });

  // GET /routes/:id
  it("Should return a route by id", async () => {
    const res = await request(app).get("/v1/routes/5fd550a7b547649dd7e37814");
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5fd550a7b547649dd7e37814",
      tagAssignment: "5fcc1bd5b5476485111184fe",
      start: new Date(1601109550000).toISOString(),
      finish: new Date(1601145776000).toISOString(),
      actions: expect.any(Array),
    });
  });

  it("Should return 400 if requesting a route by invalid assignment", async () => {
    const res = await request(app).get(
      "/v1/routes/?tagAssignment=5f8d13a764421b7156ab"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d13a764421b7156ab' is not a valid tag assignment id",
    });
  });

  it("Should return 404 if requesting a route by inexistent assignment", async () => {
    const res = await request(app).get(
      "/v1/routes/?tagAssignment=5f8d13a3b54764421b7156ab"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Tag assignment with this id does not exist",
    });
  });

  // POST /routes/
  it("Should return 400 if creating a route with empty body", async () => {
    const res = await request(app).post("/v1/routes/").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Route validation failed: start: Start date/time is required, " +
        "tagAssignment: Tag assignment ID is required",
    });
  });

  it("Should return 400 if creating a route without tag assignment", async () => {
    const res = await request(app)
      .post("/v1/routes/")
      .send({
        start: new Date(1601142588000),
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Route validation failed: tagAssignment: Tag assignment ID is required",
    });
  });

  it("Should return 400 if creating a route with tag assignment that already exists", async () => {
    const res = await request(app)
      .post("/v1/routes/")
      .send({
        tagAssignment: "5fcc1bd5b5476485111183e4",
        start: new Date(1601142588000),
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "E11000 duplicate key error dup key: " +
        "{ : ObjectId('5fcc1bd5b5476485111183e4') }",
    });
  });

  it("Should return 400 if creating a route with invalid tag assignment", async () => {
    const res = await request(app)
      .post("/v1/routes/")
      .send({
        tagAssignment: "5f8d13a3b4421b7156ab",
        start: new Date(1601142588000),
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d13a3b4421b7156ab' is not a valid tag assignment id",
    });
  });

  it("Should return 400 if creating a route with inexistent tag assignment", async () => {
    const res = await request(app)
      .post("/v1/routes/")
      .send({
        tagAssignment: "5f8d13a3b54764421b7156ab",
        start: new Date(1601142588000),
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Tag assignment with this id does not exist",
    });
  });

  it("Should return 400 if creating a route with invalid start timestamp", async () => {
    const res = await request(app).post("/v1/routes/").send({
      tagAssignment: "5fcc1bd5b54764851111853a",
      start: "NotReallyATimestamp",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Route validation failed: start: " +
        'Cast to date failed for value "NotReallyATimestamp" at path "start"',
    });
  });

  it("Should return 201 if successfully created a route", async () => {
    const res = await request(app)
      .post("/v1/routes/")
      .send({
        tagAssignment: "5fcc1bd5b54764851111853a",
        start: new Date(1601142588000),
      });
    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
    expect(res.headers.location).toMatch(/.*(\/v1\/routes\/)([a-f\d]{24})$/);
    expect(res.body).toMatchObject({
      _id: expect.any(String),
      tagAssignment: "5fcc1bd5b54764851111853a",
      start: new Date(1601142588000).toISOString(),
    });
  });

  // PATCH /routes/:id
  it("Should return 400 when updating a route with invalid id", async () => {
    const res = await request(app)
      .patch("/v1/routes/5fd550649dd7e37820")
      .send({
        finish: new Date(1601142588000),
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5fd550649dd7e37820' is not a valid object id",
    });
  });

  it("Should return 404 when updating a route with inexistent id", async () => {
    const res = await request(app)
      .patch("/v1/routes/5fd550a7a527644dd7e37820")
      .send({
        finish: new Date(1601142588000),
      });

    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Route with this id does not exist",
    });
  });

  it("Should return 400 when updating a route with invalid finish timestamp", async () => {
    const res = await request(app)
      .patch("/v1/routes/5fd550a7b547649dd7e37774")
      .send({
        finish: "NotATimestamp",
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Route validation failed: finish: " +
        'Cast to date failed for value "NotATimestamp" at path "finish"',
    });
  });

  it("Should return 400 when setting finish time earlier than start time", async () => {
    const res = await request(app)
      .patch("/v1/routes/5fd550a7b547649dd7e37820")
      .send({
        finish: new Date(1601111462000),
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Route validation failed: finish: " +
        "Finish timestamp must be later or equal to start one",
    });
  });

  it("Should return 400 when setting start time later that finish time", async () => {
    const res = await request(app)
      .patch("/v1/routes/5fd550a7b547649dd7e37815")
      .send({
        start: new Date(1601146149000),
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Route validation failed: finish: " +
        "Finish timestamp must be later or equal to start one",
    });
  });

  it("Should update a route's finish time", async () => {
    const res = await request(app)
      .patch("/v1/routes/5fd550a7b547649dd7e37820")
      .send({
        finish: new Date(1601142588000),
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5fd550a7b547649dd7e37820",
      tagAssignment: "5fe8feb0b54764faf553b1d8",
      start: new Date(1601111463000).toISOString(),
      finish: new Date(1601142588000).toISOString(),
    });
  });

  it("Should update a route's start time", async () => {
    const res = await request(app)
      .patch("/v1/routes/5fd550a7b547649dd7e37818")
      .send({
        start: new Date(1601109887000),
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5fd550a7b547649dd7e37818",
      tagAssignment: "5fcc1bd5b547648511118430",
      start: new Date(1601109887000).toISOString(),
      finish: new Date(1601146106000).toISOString(),
      actions: expect.any(Array),
    });
  });

  // DELETE /routes/:id
  it("Should return 400 when deleting a route by invalid id", async () => {
    const res = await request(app).delete("/v1/routes/5fd550649dd7e37765");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5fd550649dd7e37765' is not a valid object id",
    });
  });

  it("Should return 404 when deleting a route by inexistent id", async () => {
    const res = await request(app).delete(
      "/v1/routes/5fd550a7a537648dd7e37762"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Route with this id does not exist",
    });
  });

  it("Should return 200 when successfully deleted a route", async () => {
    const res = await request(app).delete(
      "/v1/routes/5fd550a7b547649dd7e37765"
    );
    expect(res.status).toEqual(StatusCodes.NO_CONTENT);
    expect(res.type).toBe("");
  });

  it("Should return 404 when deleting a route twice", async () => {
    const res = await request(app).delete(
      "/v1/routes/5fd550a7b547649dd7e37763"
    );
    expect(res.status).toEqual(StatusCodes.NO_CONTENT);
    expect(res.type).toBe("");

    const resSecond = await request(app).delete(
      "/v1/routes/5fd550a7b547649dd7e37763"
    );
    expect(resSecond.status).toEqual(StatusCodes.NOT_FOUND);
    expect(resSecond.type).toBe("application/json");
    expect(resSecond.body).toMatchObject({
      error: "Route with this id does not exist",
    });
  });

  // PUT /routes/:tag/actions
  it("Should return 400 when setting actions for invalid route", async () => {
    const res = await request(app)
      .put("/v1/routes/5fd550649dd7e37820/actions")
      .send({
        actions: [
          {
            station: "5f8f8c44b54764421b715f49",
            timestamp: new Date(1601115064000),
          },
        ],
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5fd550649dd7e37820' is not a valid object id",
    });
  });

  it("Should return 404 when setting actions for inexistent route", async () => {
    const res = await request(app)
      .put("/v1/routes/5fd550a7a527644dd7e37820/actions")
      .send({
        actions: [
          {
            station: "5f8f8c44b54764421b715f49",
            timestamp: new Date(1601115064000),
          },
        ],
      });

    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Route with this id does not exist",
    });
  });

  it("Should return 400 when one of the actions has invalid id", async () => {
    const res = await request(app)
      .put("/v1/routes/5fd550a7b547649dd7e37820/actions")
      .send({
        actions: [
          {
            station: "5f8f8c44b54764421b715f49",
            timestamp: new Date(1601115064000),
          },
          {
            station: "5f864421b715f49",
            timestamp: new Date(1601116065000),
          },
        ],
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Route validation failed: actions.1.station: " +
        'Cast to ObjectId failed for value "5f864421b715f49" at path "station"',
    });
  });

  it("Should return 400 when one of the actions has inexistent id", async () => {
    const res = await request(app)
      .put("/v1/routes/5fd550a7b547649dd7e37820/actions")
      .send({
        actions: [
          {
            station: "5f8f8c44b54764421b715f49",
            timestamp: new Date(1601115064000),
          },
          {
            station: "5f8f8c44b54464421a415f49",
            timestamp: new Date(1601116065000),
          },
        ],
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Some actions are invalid. " +
        "Check that all stations have valid and existent identifiers",
    });
  });

  it("Should update a route with all actions", async () => {
    const res = await request(app)
      .put("/v1/routes/5fd550a7b547649dd7e37820/actions")
      .send({
        actions: [
          {
            station: "5f8f8c44b54764421b715f49",
            timestamp: new Date(1601115064000),
          },
          {
            station: "5f8f8c44b54764421b715f4e",
            timestamp: new Date(1601116990000),
          },
          {
            station: "5f8f8c44b54764421b715f4f",
            timestamp: new Date(1610612736000),
          },
        ],
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.headers.location).toMatch(
      /.*(\/v1\/routes\/5fd550a7b547649dd7e37820)$/
    );
  });
});
