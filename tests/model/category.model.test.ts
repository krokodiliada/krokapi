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

  it("Throws an error if category is created without parameters", async () => {
    const category: ICategory = new Category();
    await expect(Category.create(category)).rejects.toThrowError();
  });

  it("Throws an error if category is created with short name only", async () => {
    const category: ICategory = new Category({
      name: {
        short: validCategory.name.short,
      },
    });
    await expect(Category.create(category)).rejects.toThrowError();
  });

  it("Throws an error if category price is negative", async () => {
    const category: ICategory = new Category(validCategory);

    category.price = -154;
    await expect(Category.create(category)).rejects.toThrowError();
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
        short: validCategory.name.short,
        long: validCategory.name.long,
      },
      participantsNumber: {
        min: 1,
        max: 5,
      },
      minCheckpoints: 0,
      maxTime: 10,
      price: 0,
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
