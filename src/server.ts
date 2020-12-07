import express from "express";
import bodyParser from "body-parser";
import * as KrokRouter from "routes/kroks";
import * as ParticipantRouter from "routes/participants";

const app = express();

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/kroks", KrokRouter.default);
app.use("/participants", ParticipantRouter.default);

// define a route handler for the default home page
app.get("/", (_, res) => {
  res.send("Hello world!");
});

export default app;
