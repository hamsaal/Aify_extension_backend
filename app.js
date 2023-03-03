require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const cookieSession = require("cookie-session");

const authRoutes = require("./routes/auth-routes");
const SuccessRoutes = require("./routes/success-routes");
const GooglePassport = require("./configurations/google-passport");

const application = express();

application.use(bodyParser.json());
application.use(bodyParser.urlencoded({ extended: true }));
application.set("view engine", "ejs");
application.use(express.static("public"));

application.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.SESSION_API_KEY],
  })
);

application.use(passport.initialize());
application.use(passport.session());
application.use("/success", SuccessRoutes);
application.use("/auth", authRoutes);
application.get("/", (req, res) => {
  res.render("home");
});

application.listen(3000, () => {
  console.log("server up on 3000;");
});
