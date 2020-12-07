import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import { populateSampleDatabase, eraseSampleDatabase } from "../utils/sampledb";

describe("Location endpoints", () => {
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

  // GET /locations/
  it("Should return a list of all locations", async () => {
    const res = await request(app).get("/locations/");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBeGreaterThan(1);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      name: expect.any(String),
      latitude: expect.any(Number),
      longitude: expect.any(Number),
    });
  });

  // GET /locations/:id
  it("Should return a location by id and set status to 200", async () => {
    const res = await request(app).get("/locations/5f8f83f6b54764421b715f05");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8f83f6b54764421b715f05",
      name: "Fear gas hot here our",
      latitude: 55.862512,
      longitude: 39.281975,
    });
  });

  it("Should return 400 when requesting location by invalid id", async () => {
    const res = await request(app).get("/locations/5f8f8764421b715f05");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when requesting inexistent location", async () => {
    const res = await request(app).get("/locations/5f8f83a6c53764421b715f05");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // DELETE /locations/:id
  it("Should return 400 when deleting location by invalid id", async () => {
    const res = await request(app).delete("/locations/5f8f8764421b715f05");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when deleting inexistent location", async () => {
    const res = await request(app).delete(
      "/locations/5f8f83a6c53764421b715f05"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when successfully deleted location", async () => {
    const res = await request(app).delete(
      "/locations/5f8f83f6b54764421b715eeb"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when deleting the same location twice", async () => {
    await request(app).delete("/locations/5f8f83f6b54764421b715eec");
    const res = await request(app).delete(
      "/locations/5f8f83f6b54764421b715eec"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // POST /locations/
  it("Should return 405 if post is not allowed to update location", async () => {
    const res = await request(app).post("/locations/5f8f83f6b54764421b715ef1");
    expect(res.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating location without data", async () => {
    const res = await request(app).post("/locations/").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating location with name only", async () => {
    const res = await request(app).post("/locations/").send({
      name: "Location name",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating location with latitude only", async () => {
    const res = await request(app).post("/locations/").send({
      latitude: 55.830387,
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating location with longitude only", async () => {
    const res = await request(app).post("/locations/").send({
      longitude: 39.411245,
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if successfully created location", async () => {
    const res = await request(app).post("/locations/").send({
      name: "Test location name",
      latitude: 55.855072,
      longitude: 39.242487,
    });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    // regex for response like /participants/5f8d0d55b54764421b715d5d
    expect(res.headers.location).toMatch(/.*(\/locations\/)([a-f\d]{24})$/);
  });

  it("Should return 400 if creating location with existent lat/long", async () => {
    const res = await request(app).post("/locations/").send({
      name: "Test location name",
      latitude: 55.828526,
      longitude: 39.376358,
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating location with invalid data", async () => {
    const res = await request(app).post("/locations/").send({
      name: "Test location name",
      latitude: "Omnomnom",
      longitude: "Boooo",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  // PATCH /locations/:id
  it("Should return 400 when updating location by invalid id", async () => {
    const res = await request(app).patch("/locations/5f8f8764421b715f05");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when updating inexistent location", async () => {
    const res = await request(app).patch("/locations/5f8f83a6c53764421b715f05");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when updating location with invalid latitude", async () => {
    const res = await request(app)
      .patch("/locations/5f8f83f6b54764421b715eff")
      .send({
        latitude: "Hoo-hoo!",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when updating location with invalid longitude", async () => {
    const res = await request(app)
      .patch("/locations/5f8f83f6b54764421b715eff")
      .send({
        longitude: "Hoo-hoo!",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when updating location with invalid name", async () => {
    const res = await request(app)
      .patch("/locations/5f8f83f6b54764421b715eff")
      .send({
        name: 13567,
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when successfully updated location name", async () => {
    const res = await request(app)
      .patch("/locations/5f8f83f6b54764421b715eff")
      .send({
        name: "New location name",
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when successfully updated latitude", async () => {
    const res = await request(app)
      .patch("/locations/5f8f83f6b54764421b715eff")
      .send({
        latitude: 55.825612,
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 when successfully updated longitude", async () => {
    const res = await request(app)
      .patch("/locations/5f8f83f6b54764421b715eff")
      .send({
        longitude: 39.260247,
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });
});
