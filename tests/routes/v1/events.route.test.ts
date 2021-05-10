import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import {
  populateSampleDatabase,
  eraseSampleDatabase,
} from "../../utils/sampledb";

describe("Event endpoints", () => {
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

  // GET /events/
  it("Should return a list of all events", async () => {
    const res = await request(app).get("/v1/events/");
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBeGreaterThan(1);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      name: expect.any(String),
      date: {
        start: expect.any(String),
        end: expect.any(String),
      },
    });
  });

  // GET /events/:id
  it("Should return an event by id", async () => {
    const res = await request(app).get("/v1/events/5f8d04b3b54764421b7156dc");
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8d04b3b54764421b7156dc",
      name: "Event - 4",
      categories: expect.any(Array),
      date: {
        start: new Date("Sep 25, 2020").toISOString(),
        end: new Date("Sep 27, 2020").toISOString(),
      },
      location: "5f8f7daab54764421b715ee9",
    });
    expect(res.body.categories.length).toBe(7);
    expect(res.body.categories[0]).toMatchObject({
      _id: "5f8d04f7b54764421b7156dd",
      name: {
        short: "S",
        long: "Sportivnaya",
      },
      participantsNumber: {
        min: 2,
        max: 2,
      },
    });
  });

  // GET /events/:id
  it("Should return 404 when the requested event is not found", async () => {
    const res = await request(app).get("/v1/events/5f8d04b3a54364421b7156dc");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Event with this id does not exist",
    });
  });

  it("Should return 400 when the GET request syntax is invalid", async () => {
    const res = await request(app).get("/v1/events/5f8d0b54764421b71c");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d0b54764421b71c' is not a valid object id",
    });
  });

  // PUT methods

  it("Should check that PUT method is not allowed for creation", async () => {
    const res = await request(app)
      .put("/v1/events")
      .send({
        name: "New Event",
        date: {
          start: new Date("May 12, 2021"),
          end: new Date("May 14, 2021"),
        },
      });

    expect(res.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Method is not allowed. Check the API documentation",
    });
  });

  it("Should return 405 if trying to update event with POST", async () => {
    const res = await request(app)
      .post("/v1/events/5f8d04b3b54764421b7156dc")
      .send({});
    expect(res.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Method is not allowed. Check the API documentation",
    });
  });

  // DELETE methods

  it("Should successfully delete an existing event by id", async () => {
    const res = await request(app).delete(
      "/v1/events/5f8d0448b54764421b7156db"
    );
    expect(res.status).toEqual(StatusCodes.NO_CONTENT);
    expect(res.type).toBe("");
  });

  it("Should return 404 when deleting inexistent resource", async () => {
    const res = await request(app).delete(
      "/v1/events/5f8d0447b54764421a7156db"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Event with this id does not exist",
    });
  });

  // POST methods

  it("Should return 400 if trying to create event with date only", async () => {
    const res = await request(app)
      .post("/v1/events")
      .send({
        date: {
          start: new Date("May 12, 2021"),
          end: new Date("May 14, 2021"),
        },
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Event validation failed: name: Name is required",
    });
  });

  it("Should return 400 if trying to create event with start date only", async () => {
    const res = await request(app)
      .post("/v1/events")
      .send({
        name: "New Event",
        date: {
          start: new Date("May 12, 2021"),
        },
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Event validation failed: date.end: End date is required, " +
        "date: Validation failed: end: End date is required",
    });
  });

  it("Should return 400 if trying to create event with name only", async () => {
    const res = await request(app).post("/v1/events").send({
      name: "New Event",
    });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Event validation failed: date: Start/End date is required",
    });
  });

  it("Should return 201 if trying to create a new event", async () => {
    const res = await request(app)
      .post("/v1/events/")
      .send({
        name: "New Event",
        date: {
          start: new Date("May 12, 2021"),
          end: new Date("May 14, 2021"),
        },
      });

    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: expect.any(String),
      name: "New Event",
      date: {
        start: new Date("May 12, 2021").toISOString(),
        end: new Date("May 14, 2021").toISOString(),
      },
      categories: [],
    });
    expect(res.headers.location).toMatch(/.*(\/v1\/events\/)([a-f\d]{24})$/);
  });

  it("Should return 400 if trying to create event with the same dates twice", async () => {
    const res = await request(app)
      .post("/v1/events")
      .send({
        name: "New Event",
        date: {
          start: new Date("Aug 25, 2037"),
          end: new Date("Aug 27, 2037"),
        },
      });

    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");

    const res2 = await request(app)
      .post("/v1/events")
      .send({
        name: "Another Event",
        date: {
          start: new Date("Aug 25, 2037"),
          end: new Date("Aug 27, 2037"),
        },
      });

    expect(res2.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res2.type).toBe("application/json");
    expect(res2.body).toMatchObject({
      error:
        "E11000 duplicate key error dup key: { : new Date(2134785600000) }",
    });
  });

  // PATCH methods

  it("Should return 400 if trying to update event with no data", async () => {
    const res = await request(app)
      .patch("/v1/events/5f8d0401b54764421b7156da")
      .send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Empty request body is received",
    });
  });

  it("Should return 404 if trying to update inexistent event", async () => {
    const res = await request(app)
      .patch("/v1/events/5f8d1401c54664421b7156da")
      .send({
        date: {
          end: new Date("May 25, 2022"),
        },
      });
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Event with this id does not exist",
    });
  });

  it("Should return 400 if trying to update event with invalid id", async () => {
    const res = await request(app)
      .patch("/v1/events/5f8d1401c5466446da")
      .send({
        "date.end": new Date("Sep 24, 2019"),
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d1401c5466446da' is not a valid object id",
    });
  });

  it("Should return 200 if successfully updated event", async () => {
    const res = await request(app)
      .patch("/v1/events/5f8d0401b54764421b7156da")
      .send({
        "date.end": new Date("Sep 24, 2019"),
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      name: "Event - 2",
      date: {
        start: new Date("Sep 20, 2019").toISOString(),
        end: new Date("Sep 24, 2019").toISOString(),
      },
    });
  });

  it("Should return 400 if updating event with invalid data", async () => {
    const res = await request(app)
      .patch("/v1/events/5f8d0401b54764421b7156da")
      .send({
        date: {
          start: "hz",
          end: 13,
        },
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body.error).toContain(
      'Cast to date failed for value "hz" at path "start"'
    );
  });

  // GET /events/:id/categories

  it("Should return 404 if trying to get data of inexistent event", async () => {
    const res = await request(app).get(
      "/v1/events/5f8d0401c54364422b7156da/categories"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Event with this id does not exist",
    });
  });

  it("Should return 400 if trying to access event by invalid id", async () => {
    const res = await request(app).get("/v1/events/5f8d4422b7156da/categories");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d4422b7156da' is not a valid object id",
    });
  });

  it("Should return a list of categories for the valid event", async () => {
    const res = await request(app).get(
      "/v1/events/5f8d04b3b54764421b7156dc/categories"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(7);
    expect(res.body[0]).toMatchObject({
      _id: "5f8d04f7b54764421b7156dd",
      name: {
        short: "S",
        long: "Sportivnaya",
      },
      participantsNumber: {
        min: 2,
        max: 2,
      },
    });
  });

  // DELETE /events/:id/categories/:categoryId

  it("Should return 404 if deleting data of inexistent event", async () => {
    const res = await request(app).delete(
      "/v1/events/5f8d0401c54364422b7156da/categories/5f8d04f7b54764421b"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Event with this id does not exist",
    });
  });

  it("Should return 400 if deleting data of invalid event", async () => {
    const res = await request(app).delete(
      "/v1/events/5f8d4422b7156da/categories/5f8d04f7b54764421b"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d4422b7156da' is not a valid object id",
    });
  });

  it("Should return 404 if trying to delete category that is not assigned to this event", async () => {
    const res = await request(app).delete(
      "/v1/events/5f8d0401b54764421b7156da/categories/5f8d04f7b54764421b7156e6"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Event does not have a category with this id",
    });
  });

  it("Should return 400 if trying to delete invalid category", async () => {
    const res = await request(app).delete(
      "/v1/events/5f8d0401b54764421b7156da/categories/5f8d04f7b54764421b"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d04f7b54764421b' is not a valid object id",
    });
  });

  it("Should return 200 if successfully deleted a category", async () => {
    const res = await request(app).delete(
      "/v1/events/5f8d0401b54764421b7156da/categories/5f8d04f7b54764421b7156dd"
    );
    expect(res.status).toEqual(StatusCodes.NO_CONTENT);
    expect(res.type).toBe("");
  });

  // PUT /events/:id/categories/:categoryId

  it("Should return 404 if inserting category to inexistent event", async () => {
    const res = await request(app).put(
      "/v1/events/5f8d0401c54364422b7156da/categories/5f8d04f7b54764421b7156e3"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Event with this id does not exist",
    });
  });

  it("Should return 400 if inserting category to invalid event", async () => {
    const res = await request(app).put(
      "/v1/events/5f8d0401c5436456da/categories/5f8d04f7b54764421b7156e3"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d0401c5436456da' is not a valid object id",
    });
  });

  it("Should return 404 if trying to add inexistent category", async () => {
    const res = await request(app).put(
      "/v1/events/5f8d0401b54764421b7156da/categories/5f8d04f7b53764421a7156e7"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Category with this id does not exist",
    });
  });

  it("Should return 400 if trying to add invalid category", async () => {
    const res = await request(app)
      .put("/v1/events/5f8d0401b54764421b7156da/categories/5f8d04f7b54764421b")
      .send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d04f7b54764421b' is not a valid object id",
    });
  });

  it("Should return 200 if successfully replaced a category", async () => {
    const res = await request(app).put(
      "/v1/events/5f8d0401b54764421b7156da/categories/5f8d04f7b54764421b7156e3"
    );
    expect(res.status).toEqual(StatusCodes.OK);
  });

  it("Should return 200 if successfully aded a new category", async () => {
    const res = await request(app).put(
      "/v1/events/5f8d0401b54764421b7156da/categories/5f8d04f7b54764421b7156e4"
    );
    expect(res.status).toEqual(StatusCodes.OK);
  });

  // GET /events/:id/location

  it("Should return 404 if getting location of inexistent event", async () => {
    const res = await request(app).get(
      "/v1/events/5f8d0401c54364422b7156da/location"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Event with this id does not exist",
    });
  });

  it("Should return 400 if getting location of invalid event", async () => {
    const res = await request(app).get(
      "/v1/events/5f8d0401c5436456da/location"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d0401c5436456da' is not a valid object id",
    });
  });

  it("Should return 404 if event does not have location", async () => {
    const res = await request(app).get(
      "/v1/events/5f8d0401b54764421b7155ff/location"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "No location assigned to this event",
    });
  });

  it("Should return 200 if getting location of existent event", async () => {
    const res = await request(app).get(
      "/v1/events/5f8d04b3b54764421b7156dc/location"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8f7daab54764421b715ee9",
      name: "Pokrov",
      latitude: 55.866277,
      longitude: 39.219146,
    });
  });

  // DELETE /events/:id/location

  it("Should return 404 if deleting location of inexistent event", async () => {
    const res = await request(app).delete(
      "/v1/events/5f8d0401c54364422b7156da/location"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Event with this id does not exist",
    });
  });

  it("Should return 400 if deleting location of invalid event", async () => {
    const res = await request(app).delete(
      "/v1/events/5f8d0401c5436456da/location"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d0401c5436456da' is not a valid object id",
    });
  });

  it("Should return 404 if deleted location that did not exist", async () => {
    // Calling the endpoint twice just in case if the location existed
    const res = await request(app).delete(
      "/v1/events/5f8d0401b54764421b7156da/location"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "No location assigned to this event",
    });
  });

  it("Should return 200 if deleted existent location", async () => {
    await request(app).put(
      "/v1/events/5f8d0401b54764421b7156da/location/5f8f8720b54764421b715f16"
    );

    const res = await request(app).delete(
      "/v1/events/5f8d0401b54764421b7156da/location"
    );
    expect(res.status).toEqual(StatusCodes.NO_CONTENT);
    expect(res.type).toBe("");
  });

  // PUT /events/:id/location/:locationId

  it("Should return 404 if creating location of inexistent event", async () => {
    const res = await request(app).put(
      "/v1/events/5f8d0401c54364422b7156da/location/5f8f83f6b21764421b715ef7"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Event with this id does not exist",
    });
  });

  it("Should return 400 if creating location of invalid event", async () => {
    const res = await request(app).put(
      "/v1/events/5f8d0401c5436456da/location/5f8f83f6b21764421b715ef7"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d0401c5436456da' is not a valid object id",
    });
  });

  it("Should return 400 if assigning invalid location", async () => {
    const res = await request(app).put(
      "/v1/events/5f8d04b3b54764421b7156dd/location/5f8f83f6b547b715efc"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8f83f6b547b715efc' is not a valid object id",
    });
  });

  it("Should return 404 if assigning location that does not exist", async () => {
    const res = await request(app).put(
      "/v1/events/5f8d04b3b54764421b7156dd/location/5f8f83f6b21764421b715ef7"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Location with this id does not exist",
    });
  });

  it("Should return 200 if replacing existent location", async () => {
    await request(app).delete("/v1/events/5f8d04b3b54764421b7156dd/location");

    const resInsert = await request(app).put(
      "/v1/events/5f8d04b3b54764421b7156dd/location/5f8f8720b54764421b715f1e"
    );
    expect(resInsert.status).toEqual(StatusCodes.OK);

    const resReplace = await request(app).put(
      "/v1/events/5f8d04b3b54764421b7156dd/location/5f8f8720b54764421b715f1e"
    );
    expect(resReplace.status).toEqual(StatusCodes.OK);
  });

  it("Should return 200 if assigning a new location", async () => {
    await request(app).delete("/v1/events/5f8d04b3b54764421b7156dd/location");

    const resInsert = await request(app).put(
      "/v1/events/5f8d04b3b54764421b7156dd/location/5f8f8720b54764421b715f23"
    );
    expect(resInsert.status).toEqual(StatusCodes.OK);
  });
});
