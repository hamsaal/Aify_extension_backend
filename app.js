const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const cookieSession = require("cookie-session");
const path = require("path");
const authRoutes = require("./routes/auth-routes");
const reqRoutes = require("./routes/req-routes");
const application = express();
const { authCheck2, authCheck } = require("./configurations/middlewares");
const admin = require("firebase-admin");

application.use(bodyParser.json());
application.use(bodyParser.urlencoded({ extended: true }));
application.set("view engine", "ejs");
application.set("views", path.join(__dirname, "views/"));
application.use(
  cookieSession({
    name: "__session",
    
    domain: "auth.textaify.com",
    maxAge: 24 * 60 * 60 * 1000,
    keys: ["notsoSurewhythiskeyisherebutitiswhatitis"],
  })
);
application.use(passport.initialize());
application.use(passport.session());
application.use("/auth", authRoutes);
application.use("/req", authCheck2, reqRoutes);
application.get("/", authCheck, async (req, res) => {
  console.log(req.session);
  if (req.session) {
    const user = await admin.auth().getUser(req.session.uid);
    res.render("loginSuccess", { ...user });
  }
  console.log(req.url);
  res.redirect(req.url);
});

exports.application = application;
