import dotenv from "dotenv";
import mongoose from "mongoose";
import { eraseSampleDatabase } from "../tests/utils/sampledb";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL ?? "", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await eraseSampleDatabase();
  await mongoose.connection.close();
};

run()
  .then(() => {
    console.log("Database has been successfully erased!");
  })
  .catch((e) => {
    console.log("Couldn't erase the database. Error occured.");
    console.log(e);
  });
