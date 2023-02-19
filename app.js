require("dotenv").config();
//
const express = require("express");
const bodyParser = require("body-parser");
c;
const passport = require("passport");
const { fetchUserByEmail, createUserInDatabase } = require("./userFile");
var GoogleStrategy = require("passport-google-oauth20").Strategy;
//
const application = express();
application.use(bodyParser.json());
application.use();
application.use;
application.use(passport.initialize());
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://www.example.com/auth/google/xyz",
    },
    (accessToken, refreshToken, profile, cb) => {
      // firebase functions here
    }
  )
);

application.get("/", (req, res) => {
  res.render("index");
});

application.post("/", (req, res) => {});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

application.listen(3000, () => {
  console.log("server up on 3000;");
});
