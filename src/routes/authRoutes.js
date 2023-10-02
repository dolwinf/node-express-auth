const express = require("express");
const User = require("../models/UserModel");
const authMiddleware = require("../middleware/authMiddleware");
const dotenv = require("dotenv");
dotenv.config();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook");

const router = express.Router();

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3000/auth/facebook/callback",
      profileFields: [
        "id",
        "first_name",
        "last_name",
        "email",
        "picture",
        "birthday",
      ],
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
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById({ _id: id });
  done(null, user);
});

router.get("/auth/facebook", passport.authenticate("facebook"));

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.json("Login successful");
  }
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.json("Login successful");
  }
);

router.get("/logout", (req, res) => {
  //.logout is provided by passport on the request object
  req.logout(() => {
    req.session.destroy((err) => {
      // Destroy the session data
      if (err) {
        return res.redirect("/"); // In case of error, redirect to home
      }
      res.clearCookie("connect.sid"); // Clear the session cookie
      res.json("User has been logged out");
    });
  });
});

module.exports = router;
