import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import {
  populateSampleDatabase,
  eraseSampleDatabase,
} from "../../utils/sampledb";

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
    await mongoose.connection.close();
  });

  // GET methods

  // GET /categories/?event=:id
  it("Should return a list of all categories for specific event", async () => {
    const res = await request(app).get(
      "/v1/categories/?event=5f8d04b3b54764421b7156dc"
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
      participantsNumber: {
        min: expect.any(Number),
        max: expect.any(Number),
      },
      minCheckpoints: expect.any(Number),
      maxTime: expect.any(Number),
    });
  });

  // GET /categories/
  it("Should return a list of all categories", async () => {
    const res = await request(app).get("/v1/categories");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(15);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      name: {
        short: expect.any(String),
        long: expect.any(String),
      },
      participantsNumber: {
        min: expect.any(Number),
        max: expect.any(Number),
      },
      minCheckpoints: expect.any(Number),
      maxTime: expect.any(Number),
    });
  });

  it("Should return 400 if event filter is invalid", async () => {
    const res = await request(app).get(
      "/v1/categories/?event=5f8d04b3b54721b76dc"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f8d04b3b54721b76dc' is not a valid object id",
    });
  });

  it("Should return 404 if event number does not exist", async () => {
    const res = await request(app).get(
      "/v1/categories/?event=5f8d04a3b54664421b2156dc"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Event with this id does not exist",
    });
  });

  // GET /categories/:id
  it("Should successfully return a category by id", async () => {
    const res = await request(app).get(
      "/v1/categories/5f8d04f7b54764421b7156de"
    );

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
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
    const res = await request(app).get("/v1/categories/5f84f7b54764421b71de");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f84f7b54764421b71de' is not a valid object id",
    });
  });

  it("Should return 404 if requesting a category by inexistent id", async () => {
    const res = await request(app).get(
      "/v1/categories/5f8d04f7a54634421b7156de"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Category with this id does not exist",
    });
  });

  // POST /categories/
  it("Should return 400 if creating a category wihtout long name", async () => {
    const res = await request(app)
      .post("/v1/categories/")
      .send({
        name: {
          short: "Short name",
        },
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Category validation failed: name.long: Long name is required, " +
        "name: Validation failed: long: Long name is required",
    });
  });

  it("Should return 400 if creating a category wihtout short name", async () => {
    const res = await request(app)
      .post("/v1/categories/")
      .send({
        name: {
          long: "Long name",
        },
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Category validation failed: name.short: Short name is required, " +
        "name: Validation failed: short: Short name is required",
    });
  });

  it("Should return 400 if creating a category without name", async () => {
    const res = await request(app).post("/v1/categories/").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Category validation failed: name: Category name is required",
    });
  });

  it("Should return 400 if creating a category with the same name", async () => {
    const res = await request(app)
      .post("/v1/categories/")
      .send({
        name: {
          short: "Che",
          long: "Chempionskaya",
        },
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        'E11000 duplicate key error dup key: { : "Che", : "Chempionskaya" }',
    });
  });

  it("Should return 201 if successfully created a category", async () => {
    const res = await request(app)
      .post("/v1/categories/")
      .send({
        name: {
          short: "X",
          long: "Very New Category",
        },
      });
    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
    expect(res.headers.location).toMatch(
      /.*(\/v1\/categories\/)([a-f\d]{24})$/
    );
  });

  // DELETE /categories/:id
  it("Should return 400 if deleting a category by invalid id", async () => {
    const res = await request(app).delete(
      "/v1/categories/5f04f7b5476441b716e5"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f04f7b5476441b716e5' is not a valid object id",
    });
  });

  it("Should return 404 if deleting a category by inexistent id", async () => {
    const res = await request(app).delete(
      "/v1/categories/5f8d04f7a54762431b7155e5"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Category with this id does not exist",
    });
  });

  it("Should return 200 if successfully deleted a category", async () => {
    const res = await request(app).delete(
      "/v1/categories/5f8d04f7b54764421b7156e5"
    );
    expect(res.status).toEqual(StatusCodes.NO_CONTENT);
    expect(res.type).toBe("");
  });

  it("Should return 404 if trying to delete the same category twice", async () => {
    await request(app).delete("/v1/categories/5f8d04f7b54764421b7156e6");
    const res = await request(app).delete(
      "/v1/categories/5f8d04f7b54764421b7156e6"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Category with this id does not exist",
    });
  });

  it("Should return 400 if deleting a category with at least one team in it", async () => {
    const res = await request(app).delete(
      "/v1/categories/5f8d04f7b54764421b7156e3"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Cannot delete category because it is being used, e.g. a team is " +
        "already registered in this category or a checkpoint was already " +
        "assigned to this category. Make sure it is not used anywhere " +
        "before deleting it.",
    });
  });

  it("Should return 400 if deleting a category with at least one CP assigned to it", async () => {
    const res = await request(app).delete(
      "/v1/categories/5f8d04f7b54764421b7156e7"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Cannot delete category because it is being used, e.g. a team is " +
        "already registered in this category or a checkpoint was already " +
        "assigned to this category. Make sure it is not used anywhere " +
        "before deleting it.",
    });
  });

  it("Should also unassign a cateogry from event when it gets deleted", async () => {
    const eventRes = await request(app).get(
      "/v1/events/5f8d0401b54764421b7155ff"
    );
    expect(eventRes.status).toEqual(StatusCodes.OK);
    expect(eventRes.type).toBe("application/json");
    expect(eventRes.body.categories).toMatchObject([
      {
        _id: "5f8d04f7b54764421b7156e8",
        name: {
          short: "D4",
          long: "To Delete 4",
        },
        participantsNumber: {
          min: 3,
          max: 6,
        },
      },
    ]);

    const res = await request(app).delete(
      "/v1/categories/5f8d04f7b54764421b7156e8"
    );
    expect(res.status).toEqual(StatusCodes.NO_CONTENT);
    expect(res.type).toBe("");

    const eventRes2 = await request(app).get(
      "/v1/events/5f8d0401b54764421b7155ff"
    );
    expect(eventRes2.status).toEqual(StatusCodes.OK);
    expect(eventRes2.type).toBe("application/json");
    expect(eventRes2.body.categories).toMatchObject([]);
  });

  // PATCH /categories/:id

  it("Should return 400 if trying to update category with no data", async () => {
    const res = await request(app)
      .patch("/v1/categories/5f8d04f7b54764421b7156e2")
      .send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Empty request body is received",
    });
  });

  it("Should return 400 if updating a category by invalid id", async () => {
    const res = await request(app).patch("/v1/categories/5f04f7b5476441b716e5");
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "'5f04f7b5476441b716e5' is not a valid object id",
    });
  });

  it("Should return 404 if updating a category by inexistent id", async () => {
    const res = await request(app).patch(
      "/v1/categories/5f8d04f7a54664411b7156e0"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Category with this id does not exist",
    });
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
      .patch("/v1/categories/5f8d04f7b54764421b7156e2")
      .send({
        "participantsNumber.min": 4,
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Cannot change participants number for this category because it " +
        "will affect existing teams. Consider creating a new category instead.",
    });
  });

  it("Should return 400 if cannot decrease maximum number of participants", async () => {
    const res = await request(app)
      .patch("/v1/categories/5f8d04f7b54764421b7156e2")
      .send({
        "participantsNumber.max": 3,
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Cannot change participants number for this category because it " +
        "will affect existing teams. Consider creating a new category instead.",
    });
  });

  it("Should return 200 if new number of participants won't affect any teams", async () => {
    const res = await request(app)
      .patch("/v1/categories/5f8d04f7b54764421b7156e2")
      .send({
        participantsNumber: {
          min: 2,
          max: 5,
        },
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8d04f7b54764421b7156e2",
      name: {
        short: "VL",
        long: "Velo-Ligero",
      },
      participantsNumber: {
        min: 2,
        max: 5,
      },
    });
  });

  /**
   * Pair {name.short, name.long} is a unique key in the Category collection,
   * thus having two categories with the same name should be prohibited.
   */
  it("Should return 400 if trying to set the same name as for the other category", async () => {
    const res = await request(app)
      .patch("/v1/categories/5f8d04f7b54764421b7156e2")
      .send({
        name: {
          short: "B",
          long: "Bambini",
        },
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: 'E11000 duplicate key error dup key: { : "B", : "Bambini" }',
    });
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
      .patch("/v1/categories/5f8d04f7b54764421b7156de")
      .send({
        minCheckpoints: 5,
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Cannot change category max time or minimum number of checkpoints " +
        "because it will affect the results of previous competitions. " +
        "Consider creating a new category instead.",
    });
  });

  /**
   * Same rules apply for maxTime as for the minCheckpoints
   */
  it("Should return 400 if not allowed to change the maximum time", async () => {
    const res = await request(app)
      .patch("/v1/categories/5f8d04f7b54764421b7156de")
      .send({
        maxTime: 9,
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Cannot change category max time or minimum number of checkpoints " +
        "because it will affect the results of previous competitions. " +
        "Consider creating a new category instead.",
    });
  });

  it("Should return 200 if updating minCheckpoints and maxTime won't affect any teams", async () => {
    const res = await request(app)
      .patch("/v1/categories/5f8d04f7b54764421b7156e9")
      .send({
        minCheckpoints: 4,
        maxTime: 9,
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8d04f7b54764421b7156e9",
      name: {
        short: "U",
        long: "To Update",
      },
      participantsNumber: {
        min: 3,
        max: 6,
      },
      minCheckpoints: 4,
      maxTime: 9,
      price: expect.any(Number),
    });
  });

  it("Should return 400 if category price cannot be a string", async () => {
    const res = await request(app)
      .patch("/v1/categories/5f8d04f7b54764421b7156e2")
      .send({
        price: "Whatever",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Category validation failed: price: " +
        'Cast to Number failed for value "Whatever" at path "price"',
    });
  });

  it("Should return 400 if category price cannot be negative", async () => {
    const res = await request(app)
      .patch("/v1/categories/5f8d04f7b54764421b7156e2")
      .send({
        price: -15,
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error: "Category validation failed: price: -15 must not be negative",
    });
  });

  it("Should return 200 if successfully updated category price", async () => {
    const res = await request(app)
      .patch("/v1/categories/5f8d04f7b54764421b7156e9")
      .send({
        price: 650,
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8d04f7b54764421b7156e9",
      name: {
        short: "U",
        long: "To Update",
      },
      participantsNumber: {
        min: expect.any(Number),
        max: expect.any(Number),
      },
      minCheckpoints: expect.any(Number),
      maxTime: expect.any(Number),
      price: 650,
    });
  });

  it("Should return 200 if successfully updated category open time", async () => {
    const res = await request(app)
      .patch("/v1/categories/5f8d04f7b54764421b7156e9")
      .send({
        price: 650,
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8d04f7b54764421b7156e9",
      name: {
        short: "U",
        long: "To Update",
      },
      participantsNumber: {
        min: expect.any(Number),
        max: expect.any(Number),
      },
      minCheckpoints: expect.any(Number),
      maxTime: expect.any(Number),
      price: 650,
    });
  });

  it("Should return 400 if trying to set close time when open time is not set", async () => {
    const res = await request(app)
      .patch("/v1/categories/5f8d04f7b54764421b7156f0")
      .send({
        activeTime: {
          close: new Date("May 25, 2022 12:53:00"),
        },
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      error:
        "Category validation failed: activeTime.close: " +
        "Category close time must be later or equal to open time, " +
        "activeTime: Validation failed: close: " +
        "Category close time must be later or equal to open time",
    });
  });

  it("Should return 200 if setting active time through the object", async () => {
    const res = await request(app)
      .patch("/v1/categories/5f8d04f7b54764421b7156f0")
      .send({
        activeTime: {
          open: new Date("May 25, 2022 12:53:00"),
          close: new Date("May 25, 2022 12:54:00"),
        },
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8d04f7b54764421b7156f0",
      name: {
        short: "U2",
        long: "To Update - 2",
      },
      activeTime: {
        open: new Date("May 25, 2022 12:53:00").toISOString(),
        close: new Date("May 25, 2022 12:54:00").toISOString(),
      },
    });
  });

  it("Should return 200 if setting active time through nested time field", async () => {
    const res = await request(app)
      .patch("/v1/categories/5f8d04f7b54764421b7156f1")
      .send({
        "activeTime.open": new Date("May 25, 2022 12:53:00"),
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5f8d04f7b54764421b7156f1",
      name: {
        short: "U3",
        long: "To Update - 3",
      },
      activeTime: {
        open: new Date("May 25, 2022 12:53:00").toISOString(),
      },
    });
  });
});
