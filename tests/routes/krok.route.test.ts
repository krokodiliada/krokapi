import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import { populateSampleDatabase, eraseSampleDatabase } from "../utils/sampledb";

describe("Krok endpoints", () => {
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

  // GET /kroks/
  it("Should return a list of all krok objects", async () => {
    const res = await request(app).get("/kroks/");
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBeGreaterThan(1);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      number: expect.any(Number),
      date: {
        start: expect.any(String),
        end: expect.any(String),
      },
    });
  });

  // GET /kroks/50
  it("Should return a krok object for krok with number 50", async () => {
    const res = await request(app).get("/kroks/50");
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8d04b3b54764421b7156dc",
      number: 50,
      season: "fall",
      categories: [
        "5f8d04f7b54764421b7156dd",
        "5f8d04f7b54764421b7156df",
        "5f8d04f7b54764421b7156de",
        "5f8d04f7b54764421b7156e0",
        "5f8d04f7b54764421b7156e3",
        "5f8d04f7b54764421b7156e2",
        "5f8d04f7b54764421b7156e1",
      ],
      date: {
        start: new Date("Sep 25, 2020").toISOString(),
        end: new Date("Sep 27, 2020").toISOString(),
      },
      location: "5f8f7daab54764421b715ee9",
    });
  });

  // GET /kroks/33
  it("Should return 404 when the requested Krok is not found", async () => {
    const res = await request(app).get("/kroks/33");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 when the GET request syntax is invalid", async () => {
    const res = await request(app).get("/kroks/what");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  // POST methods

  it("Should check that POST method is not allowed for creation", async () => {
    const res = await request(app)
      .post("/kroks")
      .send({
        number: 51,
        date: {
          start: new Date("May 12, 2021"),
          end: new Date("May 14, 2021"),
        },
      });

    expect(res.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
    expect(res.type).toBe("application/json");
  });

  it("Should return 405 if trying to update krok with POST", async () => {
    const res = await request(app).post("/kroks/48").send({});
    expect(res.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
    expect(res.type).toBe("application/json");
  });

  // DELETE methods

  it("Should successfully delete an existing Krok by number", async () => {
    const res = await request(app).delete("/kroks/49");
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 when deleting inexistent resource", async () => {
    const res = await request(app).delete("/kroks/303");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // PUT methods

  it("Should return 400 if trying to PUT w/o all required params", async () => {
    const res = await request(app)
      .put("/kroks/50")
      .send({
        date: {
          start: new Date("May 12, 2021"),
        },
      });

    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 201 if trying to PUT new resource", async () => {
    const insertedDate = {
      start: new Date("May 12, 2021"),
      end: new Date("May 14, 2021"),
    };

    const res = await request(app).put("/kroks/600").send({
      date: insertedDate,
    });

    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      number: 600,
      date: {
        start: insertedDate.start.toISOString(),
        end: insertedDate.end.toISOString(),
      },
      categories: [],
    });
  });

  it("Should return 200 if krok was successfully replaced", async () => {
    const insertedDate = {
      start: new Date("Sep 22, 2019"),
      end: new Date("Sep 24, 2019"),
    };

    const insertedCategories = [
      "5f8d04f7b54764421b7156dd",
      "5f8d04f7b54764421b7156df",
      "5f8d04f7b54764421b7156de",
      "5f8d04f7b54764421b7156e0",
      "5f8d04f7b54764421b7156e3",
      "5f8d04f7b54764421b7156e2",
      "5f8d04f7b54764421b7156e1",
      "5f8d04f7b54764421b7156e4",
    ];

    const res = await request(app).put("/kroks/48").send({
      date: insertedDate,
      categories: insertedCategories,
    });

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      number: 48,
      date: {
        start: insertedDate.start.toISOString(),
        end: insertedDate.end.toISOString(),
      },
      categories: insertedCategories,
    });
  });

  // PATCH methods

  it("Should return 400 if trying to update krok with no data", async () => {
    const res = await request(app).patch("/kroks/48").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if trying to update inexistent krok", async () => {
    const res = await request(app)
      .patch("/kroks/512")
      .send({
        date: {
          end: new Date("May 25, 2022"),
        },
      });
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if successfully updated krok", async () => {
    const res = await request(app)
      .patch("/kroks/48")
      .send({
        date: {
          end: new Date("Sep 24, 2019"),
        },
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  // GET /kroks/{number}/categories

  it("Should return 404 if trying to get data of inexistent krok", async () => {
    const res = await request(app).get("/kroks/512").send({});
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return a list of categories for the valid krok", async () => {
    const res = await request(app).get("/kroks/50/categories").send({});
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      categories: [
        "5f8d04f7b54764421b7156dd",
        "5f8d04f7b54764421b7156df",
        "5f8d04f7b54764421b7156de",
        "5f8d04f7b54764421b7156e0",
        "5f8d04f7b54764421b7156e3",
        "5f8d04f7b54764421b7156e2",
        "5f8d04f7b54764421b7156e1",
      ],
    });
  });

  // DELETE /kroks/{number}/categories/{id}

  it("Should return 404 if deleting data of inexistent krok", async () => {
    const res = await request(app)
      .delete("/kroks/512/categories/5f8d04f7b54764421b")
      .send({});
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if trying to delete inexistent category", async () => {
    const res = await request(app)
      .delete("/kroks/48/categories/5f8d04f7b54764421b")
      .send({});
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if successfully deleted a category", async () => {
    const res = await request(app)
      .delete("/kroks/48/categories/5f8d04f7b54764421b7156dd")
      .send({});
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  // PUT /kroks/{number}/categories/{id}

  it("Should return 404 if inserting category to inexistent krok", async () => {
    const res = await request(app)
      .put("/kroks/512/categories/5f8d04f7b54764421b")
      .send({});
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if trying to add inexistent category", async () => {
    const res = await request(app)
      .put("/kroks/48/categories/5f8d04f7b54764421b7156e434")
      .send({});
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if successfully replaced a category", async () => {
    const res = await request(app)
      .put("/kroks/48/categories/5f8d04f7b54764421b7156e4")
      .send({});
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if successfully aded a new category", async () => {
    const res = await request(app)
      .put("/kroks/50/categories/5f8d04f7b54764421b7156e4")
      .send({});
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  // GET /kroks/{number}/location

  it("Should return 404 if getting location of inexistent krok", async () => {
    const res = await request(app).get("/kroks/512/location").send({});
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if getting location of existent krok", async () => {
    const res = await request(app).get("/kroks/50/location").send({});
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      location: "5f8f7daab54764421b715ee9",
    });
  });

  // DELETE /kroks/{number}/location

  it("Should return 404 if deleting location of inexistent krok", async () => {
    const res = await request(app).delete("/kroks/512/location").send({});
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if deleted location that did not exist", async () => {
    const res = await request(app).delete("/kroks/48/location").send({});
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if deleted existent location", async () => {
    let res = await request(app)
      .put("/kroks/48/location/5f8f83f6b54764421b715ef7")
      .send({});

    res = await request(app).delete("/kroks/48/location").send({});
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  // PUT /kroks/{number}/location/{id}

  it("Should return 404 if creating location of inexistent krok", async () => {
    const res = await request(app).put("/kroks/512/location").send({});
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if assigning location that does not exist", async () => {
    let res = await request(app).delete("/kroks/48/location").send({});

    res = await request(app)
      .put("/kroks/48/location/5f8f83f6b547b715efc")
      .send({});
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if replacing existent location", async () => {
    let res = await request(app)
      .put("/kroks/48/location/5f8f83f6b54764421b715ef7")
      .send({});
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");

    res = await request(app)
      .put("/kroks/48/location/5f8f83f6b54764421b715ef7")
      .send({});
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if assigning a new location", async () => {
    let res = await request(app).delete("/kroks/48/location").send({});

    res = await request(app)
      .put("/kroks/48/location/5f8f83f6b54764421b715ef7")
      .send({});
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });
});
