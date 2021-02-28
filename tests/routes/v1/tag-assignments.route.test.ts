import mongoose from "mongoose";
import request from "supertest";
import { StatusCodes } from "http-status-codes";
import app from "server";
import {
  populateSampleDatabase,
  eraseSampleDatabase,
} from "../../utils/sampledb";

describe("Tag Assignment endpoints", () => {
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

  // GET /tag-assignments/
  it("Should return a list of all assignments", async () => {
    const res = await request(app).get("/v1/tag-assignments/");

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBeGreaterThan(335);
    expect(res.body.length).toBeLessThan(345);
    expect(res.body[0]).toMatchObject({
      _id: expect.any(String),
      tag: expect.any(Number),
      participant: expect.any(String),
      event: expect.any(String),
    });
  });

  it("Should return 400 if requesting assignment by invalid id", async () => {
    const res = await request(app).get(
      "/v1/tag-assignments/5f8e35464421b71e6b"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if requesting assignment by inexistent id", async () => {
    const res = await request(app).get(
      "/v1/tag-assignments/5f8e2d30b51764321b615e6b"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if successfully got assignments by id", async () => {
    const res = await request(app).get(
      "/v1/tag-assignments/5fcc1bd5b5476485111184f8"
    );

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5fcc1bd5b5476485111184f8",
      tag: 35,
      participant: "5f8d0d55b54764421b715d59",
      event: "5f8d04b3b54764421b7156dc",
    });
  });

  it("Should return 400 if requesting assignment with invalid event filter", async () => {
    const res = await request(app).get(
      "/v1/tag-assignments/?event=5f8d0401b54421b7156da&participant=5f8d0d55b54764421b715d98"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if requesting assignment with inexistent event filter", async () => {
    const res = await request(app).get(
      "/v1/tag-assignments/?event=5f8d0401b54524421b7136da&participant=5f8d0d55b54764421b715d98"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if requesting assignment with invalid participant filter", async () => {
    const res = await request(app).get(
      "/v1/tag-assignments/?event=5f8d0401b54764421b7156da&participant=5f8d0d55b53764b715d98"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if requesting assignment with inexistent participant filter", async () => {
    const res = await request(app).get(
      "/v1/tag-assignments/?event=5f8d0401b54764421b7156da&participant=5f8d0d55b53764411b715d98"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if requesting assignment by event and participant", async () => {
    const res = await request(app).get(
      "/v1/tag-assignments/?event=5f8d0401b54764421b7156da&participant=5f8d0d55b54764421b715d98"
    );

    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body.length).toBe(1);
    expect(res.body).toMatchObject([
      {
        _id: "5fcc1bd5b54764851111852f",
        tag: 339,
        participant: "5f8d0d55b54764421b715d98",
        event: "5f8d0401b54764421b7156da",
      },
    ]);
  });

  // POST /tag-assignments/
  it("Should return 400 if trying to create assignment with empty body", async () => {
    const res = await request(app).post("/v1/tag-assignments/").send({});
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating assignment with pair tag-event that already exists", async () => {
    const res = await request(app).post("/v1/tag-assignments/").send({
      participant: "5f8d0d55b54764421b715d66",
      event: "5f8d04b3b54764421b7156dc",
      tag: 339,
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating assignment with pair participant-event that already exists", async () => {
    const res = await request(app).post("/v1/tag-assignments/").send({
      participant: "5f8d0d55b54764421b715d8f",
      event: "5f8d04b3b54764421b7156dc",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if trying to create assignment with invalid tag", async () => {
    const res = await request(app).post("/v1/tag-assignments/").send({
      participant: "5f8d0d55b54764421b715d66",
      event: "5f8d0401b54764421b7156da",
      tag: "notEvenANumber",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if trying to create assignment with invalid participant", async () => {
    const res = await request(app).post("/v1/tag-assignments/").send({
      participant: "5f8d05b5476442715d66",
      event: "5f8d0401b54764421b7156da",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if trying to create assignment with invalid event", async () => {
    const res = await request(app).post("/v1/tag-assignments/").send({
      participant: "5f8d0d55b54764421b715d66",
      event: "5f8d0401b54621b7156da",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if trying to create assignment with inexistent participant", async () => {
    const res = await request(app).post("/v1/tag-assignments/").send({
      participant: "5f8d0d55b54734421a712d66",
      event: "5f8d0401b54764421b7156da",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if trying to create assignment with inexistent event", async () => {
    const res = await request(app).post("/v1/tag-assignments/").send({
      participant: "5f8d0d55b54764421b715d66",
      event: "5f8d0401b54754411b6156da",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating assignment without participant", async () => {
    const res = await request(app).post("/v1/tag-assignments/").send({
      event: "5f8d0401b54764421b7156da",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if creating assignment without event", async () => {
    const res = await request(app).post("/v1/tag-assignments/").send({
      participant: "5f8d0d55b54764421b715d66",
    });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 201 if successfully created assignment", async () => {
    const res = await request(app).post("/v1/tag-assignments/").send({
      participant: "5f8d0d55b54764421b715d66",
      event: "5f8d0401b54764421b7156da",
    });
    expect(res.status).toEqual(StatusCodes.CREATED);
    expect(res.type).toBe("application/json");
    expect(res.headers.location).toMatch(
      /.*(\/v1\/tag-assignments\/)([a-f\d]{24})$/
    );

    const resNewObject = await request(app).get(res.headers.location);
    expect(resNewObject.status).toEqual(StatusCodes.OK);
    expect(resNewObject.type).toBe("application/json");
    expect(resNewObject.body).toMatchObject({
      tag: expect.any(Number),
      participant: "5f8d0d55b54764421b715d66",
      event: "5f8d0401b54764421b7156da",
    });
  });

  // DELETE /tag-assignments/:id
  it("Should return 400 if deleting assignment with invalid id", async () => {
    const res = await request(app).delete(
      "/v1/tag-assignments/5fcc1b5b5685118e3"
    );
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if deleting assignment with inexistent id", async () => {
    const res = await request(app).delete(
      "/v1/tag-assignments/5fcc1bd5f5436484111183e3"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if successfully deleted assignment", async () => {
    const res = await request(app).delete(
      "/v1/tag-assignments/5fcc1bd5b5476485111183e3"
    );
    expect(res.status).toEqual(StatusCodes.NO_CONTENT);
    expect(res.type).toBe("");
  });

  it("Should return 404 if trying to delete the same assignment twice", async () => {
    await request(app).delete("/v1/tag-assignments/5fcc1bd5b5476485111183e5");
    const res = await request(app).delete(
      "/v1/tag-assignments/5fcc1bd5b5476485111183e5"
    );
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  // PATCH /tag-assignment/:id
  it("Should return 400 if updating assignment with invalid id", async () => {
    const res = await request(app)
      .patch("/v1/tag-assignments/5fcc1b5b5685118e3")
      .send({
        tag: 2875,
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 404 if updating assignment with inexistent id", async () => {
    const res = await request(app)
      .patch("/v1/tag-assignments/5fcc1bd5f5436484111183e3")
      .send({
        tag: 2875,
      });
    expect(res.status).toEqual(StatusCodes.NOT_FOUND);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if updating assignment with invalid tag", async () => {
    const res = await request(app)
      .patch("/v1/tag-assignments/5fcc1bd5b5476485111183e0")
      .send({
        tag: "TagShouldBeANumber",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if updating assignment with invalid participant", async () => {
    const res = await request(app)
      .patch("/v1/tag-assignments/5fcc1bd5b5476485111183e0")
      .send({
        participant: "5f0d55b54764421b71b8f",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if updating assignment with invalid event", async () => {
    const res = await request(app)
      .patch("/v1/tag-assignments/5fcc1bd5b5476485111183e0")
      .send({
        event: "5f8d3b54764421b7dc",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if updating assignment with tag that is already used", async () => {
    const res = await request(app)
      .patch("/v1/tag-assignments/5fcc1bd5b5476485111183e0")
      .send({
        tag: 113,
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if updating assignment with inexistent participant", async () => {
    const res = await request(app)
      .patch("/v1/tag-assignments/5fcc1bd5b5476485111183e0")
      .send({
        participant: "5f8e2d30b54764321b615ef0",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if updating assignment with inexistent event", async () => {
    const res = await request(app)
      .patch("/v1/tag-assignments/5fcc1bd5b5476485111183e0")
      .send({
        event: "5f8e2d30b54764321b615ef0",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if updating assignment's event fails because pair tag-event already exists", async () => {
    const res = await request(app)
      .patch("/v1/tag-assignments/5fcc1bd5b54764851111852e")
      .send({
        event: "5f8d04b3b54764421b7156dc",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if updating assignment's participant fails because pair participant-event already exists", async () => {
    const res = await request(app)
      .patch("/v1/tag-assignments/5fcc1bd5b54764851111852e")
      .send({
        participant: "5f8d0d55b54764421b715d98",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 400 if updating assignment's event fails because pair participant-event already exists", async () => {
    const res = await request(app)
      .patch("/v1/tag-assignments/5fcc1bd5b54764851111852e")
      .send({
        event: "5f8d04b3b54764421b7156dc",
      });
    expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(res.type).toBe("application/json");
  });

  it("Should return 200 if successfully updated assignment's tag", async () => {
    const res = await request(app)
      .patch("/v1/tag-assignments/5fcc1bd5b54764851111850b")
      .send({
        tag: 2935,
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5fcc1bd5b54764851111850b",
      tag: 2935,
      participant: "5f8d0d55b54764421b715d7a",
      event: "5f8d04b3b54764421b7156dc",
    });
  });

  it("Should return 200 if successfully updated assignment's participant", async () => {
    const res = await request(app)
      .patch("/v1/tag-assignments/5fcc1bd5b54764851111850c")
      .send({
        participant: "5f8d0d55b54764421b715d5e",
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5fcc1bd5b54764851111850c",
      tag: 314,
      participant: "5f8d0d55b54764421b715d5e",
      event: "5f8d04b3b54764421b7156dc",
    });
  });

  it("Should return 200 if successfully updated assignment's event", async () => {
    const res = await request(app)
      .patch("/v1/tag-assignments/5fcc1bd5b54764851111850d")
      .send({
        event: "5f8d0448b54764421b7156db",
      });
    expect(res.status).toEqual(StatusCodes.OK);
    expect(res.type).toBe("application/json");
    expect(res.body).toMatchObject({
      _id: "5fcc1bd5b54764851111850d",
      tag: 313,
      participant: "5f8d0d55b54764421b715d7e",
      event: "5f8d0448b54764421b7156db",
    });
  });
});
