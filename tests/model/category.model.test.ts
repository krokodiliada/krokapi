import mongoose from "mongoose";
import faker from "faker";
import Category, { ICategory } from "model/Category";

const validCategory: ICategory = new Category({
  name: {
    short: faker.name.firstName(),
    long: faker.name.lastName(),
  },
});

describe("Category model", () => {
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
    await Category.deleteMany({});
  });

  it("Throws an error if category is created without parameters", () => {
    const category: ICategory = new Category();
    expect(category.validate).toThrow();
  });

  it("Throws an error if category is created with short name only", () => {
    const category: ICategory = new Category({
      name: {
        short: validCategory.name.short,
      },
    });
    expect(category.validate).toThrow();
  });

  it("Should create a new category with the name", async () => {
    expect.assertions(7);

    const category: ICategory = new Category(validCategory);

    const spy = jest.spyOn(category, "save");

    // Should await so the teardown doesn't throw an exception
    const savedCategory: ICategory = await category.save();

    expect(spy).toHaveBeenCalled();

    expect(savedCategory).toMatchObject({
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

    expect(savedCategory.description).toBeUndefined();
    expect(savedCategory.notes).toBeUndefined();
    expect(savedCategory.participantsNumber).toMatchObject({
      min: 1,
      max: 5,
    });
    expect(savedCategory.minCheckpoints).toBe(0);
    expect(savedCategory.maxTime).toBe(10);
  });
});
