const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const allRoutes = require("./app/router/router");

const app = express();
dotenv.config();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors({ credentials: true, origin: process.env.ALLOW_CORS_ORIGIN }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET_KEY));
app.use("/api", allRoutes);

mongoose
  .connect(process.env.URL_MONGODB)
  .then(() => {
    console.log("✅ MongoDB is connected");
  })
  .catch((err) => {
    console.log(err);
  });


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
