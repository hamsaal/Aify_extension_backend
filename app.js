const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const cookieSession = require("cookie-session");
const path = require("path");
const authRoutes = require("./routes/auth-routes");
const SuccessRoutes = require("./routes/success-routes");
const GooglePassport = require("./configurations/google-passport");
const application = express();
application.use(bodyParser.json());
application.use(bodyParser.urlencoded({ extended: true }));
application.set("view engine", "ejs");
application.set("views", path.join(__dirname, "views/"));
application.use(
  cookieSession({
    name: "__session",
    maxAge: 24 * 60 * 60 * 1000,
    keys: ["notsoSurewhythiskeyisherebutitiswhatitis"],
  })
);
// application.use(cookieParser(process.env.COOKIE_KEY));

application.use(passport.initialize());
application.use(passport.session());
application.use("/success", SuccessRoutes);
application.use("/auth", authRoutes);
application.get("/", (req, res) => {
  res.render("home");
});
/* application.listen(3000, () => {
  console.log("server up on 3000;");
});
 */
exports.application = application;
