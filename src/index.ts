import app from "server";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const port = 8080; // default port to listen

// start the Express server
mongoose
  .connect(process.env.MONGO_URL ?? "", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`server started at http://localhost:${port}`);
    });
  })
  .catch(() => {
    console.log("Cannot connect to mongodb. Won't be listening to API.");
  });
