import dotenv from "dotenv";
import mongoose from "mongoose";

import { populateSampleDatabase } from "../tests/utils/sampledb";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL ?? "", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await populateSampleDatabase();
  await mongoose.connection.close();
};

run()
  .then(() => {
    console.log("Database has been successfully populated with test data!");
  })
  .catch((e) => {
    console.log(
      "Couldn't populate the database with test data. Error occured."
    );
    console.log(e);
  });
