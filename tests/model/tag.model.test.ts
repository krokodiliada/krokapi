import mongoose from "mongoose";
import Tag, { ITag } from "model/Tag";

const validTag: ITag = new Tag({
  number: 111,
});

describe("Tag model", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL ?? "", {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    mongoose.connection.close();
  });

  afterEach(async () => {
    await Tag.deleteMany({});
  });

  it("Throws an error if tag is created without parameters", () => {
    const tag: ITag = new Tag();
    expect(tag.validate).toThrow();
  });

  it("Should create a new tag with the tag number", async () => {
    expect.assertions(4);

    const tag: ITag = new Tag(validTag);
    const spy = jest.spyOn(tag, "save");
    const savedTag: ITag = await tag.save();

    expect(spy).toHaveBeenCalled();

    expect(savedTag).toMatchObject({
      number: expect.any(Number),
      enabled: expect.any(Boolean),
    });

    expect(savedTag.number).toBe(111);
    expect(savedTag.enabled).toBe(true);
  });
});
