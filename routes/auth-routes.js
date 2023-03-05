const express = require("express");
const router = express.Router();
const { emailAuth } = require("../configurations/email");
const passport = require("passport");
const { NewUserAuth } = require("../configurations/newUser");
const admin = require("firebase-admin");
const { capitalizeFirstLetter } = require("../configurations/imp-func");

router.post("/email", async (req, res) => {
  try {
    const UserData = await emailAuth(req.body.email, req.body.password);
    const now = admin.firestore.Timestamp.now().toDate();
    const oneHourLater = new Date(now.getTime() + 3400 * 1000);
    req.session.emailuser = UserData.idToken;
    req.session.uid = UserData.localId;
    req.session.refToken = UserData.refreshToken;
    req.session.expiryTime = oneHourLater;
    // req.session.emailuser = JSON.stringify(payload);
    res.status(200).send("Success");
  } catch (e) {
    console.log(e);
    const errorCode = e.response?.data?.error?.message
      ? e.response?.data?.error?.message.split("_").join(" ")
      : e.response?.data?.message
      ? e.response?.data?.message.split("_").join(" ")
      : e;
    res.status(400).send(errorCode);
  }
});

router.post("/register", async (req, res) => {
  try {
    await NewUserAuth(req.body.email, req.body.password, req.body.name);
    /* const now = admin.firestore.Timestamp.now().toDate();
    const oneHourLater = new Date(now.getTime() + 3400 * 1000);
    const payload = {
      emailuser: UserData.idToken,
      uid: UserData.localId,
      refToken: UserData.refreshToken,
      expiryTime: oneHourLater.toJSON(),
    };
    req.session = payload; */
    res.status(200).send("Success");
  } catch (e) {
    res.status(400).send("Error while signing up.");
  }
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email", "openid"] })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

module.exports = router;
