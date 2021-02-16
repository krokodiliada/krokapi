import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";

import V1Router from "routes/v1";

const app = express();

// Configuring body parser middleware
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set the API version to v1 by default
app.use("/v1", V1Router);

// define a route handler for the default home page
V1Router.get("/", (_, res) => {
  res.send("Hello world!");
});

export default app;
