require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const errorHandler = require("./middleware/errorHandler");
const corsOptions = require("./config/corsOptions");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const connectDB = require("./config/dbConn");
const port = process.env.PORT || 4000;

// connect to MongoDB
connectDB();

// custom middleware
app.use((req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
});
// Middleware to handle urlencoded data
app.use(express.urlencoded({ extended: false }));

// Middleware to handle json data
app.use(express.json());

// Middleware to handle cookies
app.use(cookieParser());

// handle credentials
app.use(credentials);

// Middleware to handle cors - cross origin resource sharing
app.use(cors(corsOptions));

// Middleware to handle static files
app.use(express.static(path.join(__dirname, "/public")));

app.use("/", require("./routes/root"));
app.use("/register", require("./routes/register"));
app.use("/auth", require("./routes/auth"));
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));

// verify JWT
app.use(verifyJWT);
app.use("/employees", require("./routes/api/employees"));
app.use("/users", require("./routes/api/users"));

// handle 404
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
    return;
  } else if (req.accepts("json")) {
    res.json({ error: "Not found" });
    return;
  } else res.type("txt").send("Not found");
});

// handle errors
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
