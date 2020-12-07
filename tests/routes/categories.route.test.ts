import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import { populateSampleDatabase, eraseSampleDatabase } from "../utils/sampledb";

describe("Category endpoints", () => {
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

  // GET /categories/?krok=:id
  it("Should return a list of all categories for specific krok", async () => {
    const res = await request(app).get(
      "/categories/?krok=505f8d04b3b54764421b7156dc"
    );

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(7);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      name: {
        short: expect.any(String),
        long: expect.any(String),
      },
      description: expect.any(String),
      participantsNumber: {
        min: expect.any(Number),
        max: expect.any(Number),
      },
      minCheckpoints: expect.any(Number),
      maxTime: expect.any(Number),
      notes: expect.any(String),
    });
  });

  // GET /categories/
  it("Should return a list of all categories", async () => {
    const res = await request(app).get("/categories");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(8);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      name: {
        short: expect.any(String),
        long: expect.any(String),
      },
      description: expect.any(String),
      participantsNumber: {
        min: expect.any(Number),
        max: expect.any(Number),
      },
      minCheckpoints: expect.any(Number),
      maxTime: expect.any(Number),
      notes: expect.any(String),
    });
  });

  it("Should return 400 if krok filter is invalid", async () => {
    const res = await request(app).get("/categories/?krok=5f8d04b3b54721b76dc");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if krok number does not exist", async () => {
    const res = await request(app).get(
      "/categories/?krok=5f8d04a3b54664421b2156dc"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(0);
  });

  // GET /categories/:id
  it("Should successfully return a category by id", async () => {
    const res = await request(app).get("/categories/5f8d04f7b54764421b7156de");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body[0]).toMatchObject({
      _id: "5f8d04f7b54764421b7156de",
      name: {
        short: "V",
        long: "Velo",
      },
      participantsNumber: {
        min: 1,
        max: 1,
      },
      minCheckpoints: 0,
      maxTime: 10,
    });
  });

  it("Should return 400 if requesting a category by invalid id", async () => {
    const res = await request(app).get("/categories/5f84f7b54764421b71de");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if requesting a category by inexistent id", async () => {
    const res = await request(app).get("/categories/5f8d04f7a54634421b7156de");
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // POST /categories/
  it("Should return 400 if creating a category wihtout short name", async () => {
    const res = await request(app)
      .post("/categories/")
      .send({
        name: {
          short: "Short name",
        },
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating a category wihtout long name", async () => {
    const res = await request(app)
      .post("/categories/")
      .send({
        name: {
          long: "Long name",
        },
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating a category with the same name", async () => {
    const res = await request(app)
      .post("/categories/")
      .send({
        name: {
          short: "Che",
          long: "Chempionskaya",
        },
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating a category with invalid name", async () => {
    const res = await request(app)
      .post("/categories/")
      .send({
        name: {
          short: 15,
          long: 289,
        },
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 201 if successfully created a category", async () => {
    const res = await request(app)
      .post("/categories/")
      .send({
        name: {
          short: "X",
          long: "Very New Category",
        },
      });
    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
    expect(res.headers.location).toMatch("/.*(/categories/(.+))$");
  });

  // DELETE /categories/:id
  it("Should return 400 if deleting a category by invalid id", async () => {
    const res = await request(app).delete("/categories/5f04f7b5476441b716e5");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if deleting a category by inexistent id", async () => {
    const res = await request(app).delete(
      "/categories/5f8d04f7a54762431b7155e5"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if successfully deleted a category", async () => {
    const res = await request(app).delete(
      "/categories/5f8d04f7b54764421b7156e5"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if trying to delete the same category twice", async () => {
    await request(app).delete("/categories/5f8d04f7b54764421b7156e6");
    const res = await request(app).delete(
      "/categories/5f8d04f7b54764421b7156e6"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if deleting a category with at least one team in it", async () => {
    const res = await request(app).delete(
      "/categories/5f8d04f7b54764421b7156e3"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if deleting a category with at least one CP assigned to it", async () => {
    const res = await request(app).delete(
      "/categories/5f8d04f7b54764421b7156e7"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should also unassign a cateogry from krok when it gets deleted", async () => {
    const krokRes = await request(app).get("/kroks/5f8d0401b54764421b7155ff");
    expect(krokRes.status).toEqual(StatusCodes.OK);
    expect(krokRes.type).toBe("application/json");
    expect(krokRes.body.categories).toBe(["5f8d04f7b54764421b7156e8"]);

    const res = await request(app).delete(
      "/categories/5f8d04f7b54764421b7156e8"
    );
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");

    const krokRes2 = await request(app).get("/kroks/5f8d0401b54764421b7155ff");
    expect(krokRes2.status).toEqual(StatusCodes.OK);
    expect(krokRes2.type).toBe("application/json");
    expect(krokRes2.body.categories).toBe([]);
  });

  // PATCH /categories/:id
  it("Should return 400 if updating a category by invalid id", async () => {
    const res = await request(app).patch("/categories/5f04f7b5476441b716e5");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if updating a category by inexistent id", async () => {
    const res = await request(app).patch(
      "/categories/5f8d04f7a54664411b7156e0"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  /**
   * Category model has a field { participantsNumber: {min, max} }.
   * Changing the minimum or the maximum numbef of participants in
   * the category might lead some teams to becoming disallowed from
   * participating. To avoid that, we prohibit changing participantsNumber
   * if new limits might affect at least one team in this category.
   */
  it("Should return 400 if cannot increase minimum number of participants", async () => {
    const res = await request(app)
      .patch("/categories/5f8d04f7b54764421b7156e2")
      .send({
        "participantsNumber.min": 2,
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if cannot decrease maximum number of participants", async () => {
    const res = await request(app)
      .patch("/categories/5f8d04f7b54764421b7156e2")
      .send({
        "participantsNumber.max": 3,
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if new number of participants won't affect any teams", async () => {
    const res = await request(app)
      .patch("/categories/5f8d04f7b54764421b7156e2")
      .send({
        participantsNumber: {
          min: 2,
          max: 5,
        },
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });

  /**
   * Pair {name.short, name.long} is a unique key in the Category collection,
   * thus having two categories with the same name should be prohibited.
   */
  it("Should return 400 if trying to set the same name as for the other category", async () => {
    const res = await request(app)
      .patch("/categories/5f8d04f7b54764421b7156e2")
      .send({
        name: {
          short: "B",
          long: "Bambini",
        },
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  /**
   * If there are entries in the Route collection related to the category that
   * needs to be updated, then it means that there are teams that had already
   * started the race in this category. Therefore, changing the minimum number
   * of checkpoints means changing the rules after the race had started, which
   * may lead to some teams being unexpectedly disqualified.
   *
   * Another unexpected behavior would be that the results of all previous
   * competitions might be recalculated due to this change. These unexpected
   * behaviours should be prohibited.
   */
  it("Should return 400 if not allowed to change the minimum number of checkpoints", async () => {
    const res = await request(app)
      .patch("/categories/5f8d04f7b54764421b7156de")
      .send({
        minCheckpoints: 5,
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  /**
   * Same rules apply as for the minCheckpoints
   */
  it("Should return 400 if not allowed to change the maximum time", async () => {
    const res = await request(app)
      .patch("/categories/5f8d04f7b54764421b7156de")
      .send({
        maxTime: 9,
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if updating minCheckpoints and maxTime won't affect any teams", async () => {
    const res = await request(app)
      .patch("/categories/5f8d04f7b54764421b7156e9")
      .send({
        minCheckpoints: 4,
        maxTime: 9,
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
  });
});