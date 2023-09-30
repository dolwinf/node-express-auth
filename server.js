const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./src/routes/authRoutes");
const session = require("express-session");
const passport = require("passport");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("Connected to DB"))
  .catch((e) => console.log("Unable to connect to MongoDB Atlas", e));

app.use(express.json());
app.use("/", authRoutes);

//Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
