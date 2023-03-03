const express = require("express");
const router = express.Router();

const authCheck = (req, res, next) => {
  if (!req.session.emailuser && !req.user) {
    res.redirect("/");
  } else {
    next();
  }
};

router.get("/", authCheck, (req, res) => {
  res.render("loginSuccess");
});
module.exports = router;
