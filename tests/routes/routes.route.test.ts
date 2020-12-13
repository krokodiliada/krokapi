import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import { populateSampleDatabase, eraseSampleDatabase } from "../utils/sampledb";

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
    mongoose.connection.close();
  });

  // GET /routs/:tag?krok=:id
  it("Should return 400 if trying to get a route w/o krok filter", async () => {
    const res = await request(app).get("/routes/457");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if trying to get a route with invalid tag", async () => {
    const res = await request(app).get(
      "/routes/sometag?krok=5f8d04b3b54764421b7156dc"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if trying to get a route with inexistent tag", async () => {
    const res = await request(app).get(
      "/routes/600?krok=5f8d04b3b54764421b7156dc"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if trying to get a route with inexistent krok", async () => {
    const res = await request(app).get(
      "/routes/208?krok=5f8d04b3b52764321b7156dc"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if trying to get a route with invalid krok", async () => {
    const res = await request(app).get("/routes/208?krok=5f8d04b3b527643c");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return a route by tag and krok filter", async () => {
    const res = await request(app).get(
      "/routes/320?krok=5f8d04b3b54764421b7156dc"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5fd550a7b547649dd7e3772a",
      tag: 320,
      krok: "5f8d04b3b54764421b7156dc",
      actions: [
        {
          station: "5f8f8c44b54764421b715f50",
          timestamp: new Date(1601119170000).toISOString(),
        },
        {
          station: "5f8f8c44b54764421b715f3e",
          timestamp: new Date(1601120966000).toISOString(),
        },
      ],
      start: new Date(1601114383000).toISOString(),
      finish: new Date(1601130083000).toISOString(),
    });
  });

  // PUT /routes/:tag
  it("Should return 400 if trying to create a route with empty body", async () => {
    const res = await request(app).put("/routes/457").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating a route with invalid tag", async () => {
    const res = await request(app).put("/routes/tagIsNotEvenANumber").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if replacing route that already has a finish time", async () => {
    const res = await request(app)
      .put("/routes/52")
      .send({
        krok: "5f8d0401b54764421b7156da",
        start: new Date("Sep 12, 2020"),
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating route without krok reference", async () => {
    const res = await request(app)
      .put("/routes/457")
      .send({
        start: new Date("Sep 12, 2020"),
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating route without start timestamp", async () => {
    const res = await request(app).put("/routes/457").send({
      krok: "5f8d0401b54764421b7156da",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating route with invalid krok reference", async () => {
    const res = await request(app)
      .put("/routes/457")
      .send({
        krok: "5f8d0764421b7156da",
        start: new Date("Sep 12, 2020"),
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating route with inexistent krok reference", async () => {
    const res = await request(app)
      .put("/routes/457")
      .send({
        krok: "5f8d0401a54763421b7256da",
        start: new Date("Sep 12, 2020"),
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating route with invalid start timestamp", async () => {
    const res = await request(app).put("/routes/457").send({
      krok: "5f8d0401a54763421b7256da",
      start: "NotReallyADate",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should create a route", async () => {
    const res = await request(app)
      .put("/routes/456")
      .send({
        krok: "5f8d0401b54764421b7156da",
        start: new Date("Sep 12, 2020"),
      });

    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
  });

  // PATCH /routes/:tag
  it("Should return 400 when updating a route with invalid tag", async () => {
    const res = await request(app)
      .patch("/routes/invalidTag")
      .send({
        finish: new Date(1601142588000),
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when updating a route with invalid finish timestamp", async () => {
    const res = await request(app).patch("/routes/162").send({
      finish: "NotATimestamp",
    });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should update a route's finish time", async () => {
    const res = await request(app)
      .patch("/routes/162")
      .send({
        finish: new Date(1601142588000),
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  // PUT /routes/:tag/actions
  it("Should return 400 when setting actions for invalid route", async () => {
    const res = await request(app)
      .patch("/routes/5fd550649dd7e37820/actions")
      .send({
        actions: [
          {
            station: 13,
            timestamp: new Date(1601115064000),
          },
        ],
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when setting actions for inexistent route", async () => {
    const res = await request(app)
      .patch("/routes/5fd550a7a527644dd7e37820/actions")
      .send({
        actions: [
          {
            station: 13,
            timestamp: new Date(1601115064000),
          },
        ],
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should update a route with all actions", async () => {
    const res = await request(app)
      .patch("/routes/5fd550a7b547649dd7e37820/actions")
      .send({
        actions: [
          {
            station: 13,
            timestamp: new Date(1601115064000),
          },
          {
            station: 18,
            timestamp: new Date(1601116990000),
          },
          {
            station: 19,
            timestamp: new Date(1610612736000),
          },
        ],
      });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });
});
