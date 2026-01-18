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

const allowedOrigins = [
  "http://localhost:3000",
  "https://mindspace-webrtc-videocall-static.onrender.com",
  "https://mindspace-webrtc-videocall-3.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
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
