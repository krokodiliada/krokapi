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

  // GET /locations/
  it("Should return a list of all locations", async () => {
    const res = await request(app).get("/v1/locations/");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBeGreaterThan(45);
    expect(res.body.length).toBeLessThan(50);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      name: expect.any(String),
      latitude: expect.any(Number),
      longitude: expect.any(Number),
      water: expect.any(Boolean),
    });
  });

  it("Should return 400 if requestion location by invalid id", async () => {
    const res = await request(app).get("/v1/locations/5f8f87205474421b7151c");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if requestion location by inexistent id", async () => {
    const res = await request(app).get(
      "/v1/locations/5f8f8720b54764321a615f1c"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // GET /locations/:id
  it("Should return a location by id", async () => {
    const res = await request(app).get(
      "/v1/locations/5f8f8720b54764421b715f1c"
    );

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8f8720b54764421b715f1c",
      name: "Son prevent who",
      latitude: 55.824484,
      longitude: 39.258996,
      water: false,
    });
  });

  // POST /locations/
  it("Should return 400 if creating location without body", async () => {
    const res = await request(app).post("/v1/locations/").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating location without name", async () => {
    const res = await request(app).post("/v1/locations/").send({
      latitude: 55.123456,
      longitude: 39.123456,
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating location without latitude", async () => {
    const res = await request(app).post("/v1/locations/").send({
      name: "Brand new location that does not exist yet",
      longitude: 39.123456,
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating location without longitude", async () => {
    const res = await request(app).post("/v1/locations/").send({
      name: "Brand new location that does not exist yet",
      latitude: 55.123456,
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating location with existing name", async () => {
    const res = await request(app).post("/v1/locations/").send({
      name: "Congress enter choice",
      latitude: 55.123456,
      longitude: 39.123456,
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating location with existing coordinates", async () => {
    const res = await request(app).post("/v1/locations/").send({
      name: "Brand new location that does not exist yet",
      latitude: 55.825614,
      longitude: 39.260248,
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 201 if successfully created location", async () => {
    const res = await request(app).post("/v1/locations/").send({
      name: "Brand new location that does not exist yet",
      latitude: 55.123456,
      longitude: 39.123456,
    });
    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
    expect(res.headers.location).toMatch(/.*(\/v1\/locations\/)([a-f\d]{24})$/);
  });

  // DELETE /locations/:id
  it("Should return 400 if deleting location by invalid id", async () => {
    const res = await request(app).delete("/v1/locations/5f8f80b547644215f33");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if deleting location by inexistent id", async () => {
    const res = await request(app).delete(
      "/v1/locations/5f8f8720a54763421b714f33"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if successfully deleted location", async () => {
    const res = await request(app).delete(
      "/v1/locations/5f8f8720b54764421b715f33"
    );
    expect(res.status).toEqual(StatusCodes.NO_CONTENT);
    expect(res.type).toBe("");
  });

  it("Should return 404 if trying to delete the same location twice", async () => {
    await request(app).delete("/v1/locations/5f8f8720b54764421b715f23");
    const res = await request(app).delete(
      "/v1/locations/5f8f8720b54764421b715f23"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // PATCH /locations/:id
  it("Should return 400 if updating location by invalid id", async () => {
    const res = await request(app).patch("/v1/locations/5f8f80b547644215f33");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if updating location by inexistent id", async () => {
    const res = await request(app).patch(
      "/v1/locations/5f8f8710b54764321b415f33"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if setting location that is already used", async () => {
    const res = await request(app)
      .patch("/v1/locations/5f8f8720b54764421b715f1f")
      .send({
        latitude: 55.850383,
        longitude: 39.263923,
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if setting name that is already used", async () => {
    const res = await request(app)
      .patch("/v1/locations/5f8f8720b54764421b715f14")
      .send({
        name: "Past low radio",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if successfully updated location", async () => {
    const res = await request(app)
      .patch("/v1/locations/5f8f8720b54764421b715f1d")
      .send({
        name: "New updated name",
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8f8720b54764421b715f1d",
      name: "New updated name",
      latitude: 55.828526,
      longitude: 39.376358,
    });
  });
});
