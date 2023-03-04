const express = require("express");
const router = express.Router();
const { emailAuth } = require("../configurations/email");
const passport = require("passport");
const { NewUserAuth } = require("../configurations/newUser");

router.post("/email", async (req, res) => {
  const UserData = await emailAuth(req.body.email, req.body.password);
  req.session.emailuser = UserData.idToken;
  res.redirect("/success/");
});

router.post("/register", async (req, res) => {
  const UserData = await NewUserAuth(req.body.email, req.body.password);
  req.session.emailuser = UserData.idToken;
  res.redirect("/success/");
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email", "openid"] })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/success/");
  }
);

module.exports = router;
