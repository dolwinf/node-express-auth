const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const authMiddleware = require("../middleware/authMiddleware");
const dotenv = require("dotenv");
dotenv.config();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const router = express.Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // Check if user exists in our database
      const { provider } = profile;
      const { given_name, family_name, email, picture } = profile._json;
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        return done(null, existingUser);
      }

      // If not, create a new user
      const user = await new User({
        email: email,
        first_name: given_name,
        last_name: family_name,
        auth_provider: provider,
      }).save();
      done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    console.log("Logged in");
    res.redirect("/");
  }
);

module.exports = router;
