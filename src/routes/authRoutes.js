const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const validator = require("validator");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const authMiddleware = require("../middleware/authMiddleware");

// Setup nodemailer
let transporter = nodemailer.createTransport({
  // Trasnport configuration
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "dolwinf@gmail.com",
    clientId:
      "501654627364-bd2pvnpgvie8se9jnmbjinbrqgabgdop.apps.googleusercontent.com",
    clientSecret: "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",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const router = express.Router();

const dotenv = require("dotenv");

if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
} else {
  dotenv.config({ path: ".env.development" });
}

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (email === null || email === undefined || !validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  if (password.length <= 8 || password === null || password === undefined) {
    return res
      .status(400)
      .json({ message: "Password should be more than 8 characters" });
  }

  // Check if user exists
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res
      .status(400)
      .json({ message: "Email has already been registered" });
  }

  // Create a validation token
  const validationToken = crypto.randomBytes(20).toString("hex");

  //Send an email to the user with the validation token
  // Send validation email first
  const mailOptions = {
    from: "dolwinf@gmail.com",
    to: email,
    subject: "Email Validation",
    text: `Please validate your email by clicking on the following link: http://localhost:3000/validate-account?token=${validationToken}`,
  };

  //User will click on the link, that should go to an endpoint that fetches the email and retrieves the token and compares it and then marks the account
  //as activated if the token matches.

  try {
    await transporter.sendMail(mailOptions);
  } catch (e) {
    console.log(e);
  }

  try {
    const user = new User(req.body);
    user.validation_token = validationToken;
    user.account_validated = false;
    await user.save();
    res.status(201).send({
      message:
        "Please check your email and click on the validation link to activate your account",
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/validate-account", async (req, res) => {
  const { token } = req.query;

  // Retrieve the user associated with this token
  const user = await User.findOne({ validation_token: token });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Invalid or expired validation token" });
  }

  user.validation_token = null;

  try {
    await user.save();
    res.status(200).json({ message: "Email validated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error validating email" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(400).send({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).send({ token });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
