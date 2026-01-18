import "dotenv/config";
import express, { urlencoded } from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/users.routes.js";
const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8080);

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);
const start = async () => {
  app.set("mongo_user");
  const connectionDb = await mongoose.connect(process.env.MONGO_URL);
  console.log(`connected to ${connectionDb.connection.host}`);
  server.listen(app.get("port"), () => {
    console.log(`____________App is listing_____________`);
  });
};

start();
