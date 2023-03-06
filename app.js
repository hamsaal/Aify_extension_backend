const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const expressSession = require("express-session");
const FirestoreStore = require("connect-session-firebase")(expressSession);
const path = require("path");
const authRoutes = require("./routes/auth-routes");
const GooglePassport = require("./configurations/google-passport");
const reqRoutes = require("./routes/req-routes");
const application = express();
var cors = require("cors");
const { authCheck2, authCheck } = require("./configurations/middlewares");
const admin = require("firebase-admin");
const keys = require("./configurations/keys");
const { encrypt } = require("./configurations/imp-func");
// application.set("trust proxy", 3);
application.use(cors({ origin: true, credentials: true }));
application.use(bodyParser.json());
application.use(bodyParser.urlencoded({ extended: true }));
application.set("view engine", "ejs");
application.set("views", path.join(__dirname, "views/"));
application.use(
  expressSession({
    store: new FirestoreStore({
      database: admin.database(),
    }),
    name: "__session",
    secret: "My fuciogjedinf dsaiodj8921389ds.ds",
    resave: false,
    saveUninitialized: false,
    cookie: keys.options,
  })
);
application.use(passport.initialize());
application.use(passport.session());
application.use("/auth", authRoutes);
application.use("/req", authCheck2, reqRoutes);

application.get("/logout", authCheck, async (req, res) => {
  req.session.destroy();
  res
    .clearCookie("__session")
    .clearCookie("userToken")
    .clearCookie("uid")
    .clearCookie("refToken")
    .clearCookie("expiryTime")
    .redirect("/");
});

application.get("/", authCheck, async (req, res) => {
  if (req.session) {
    const user = await admin
      .auth()
      .getUser(req.session.uid ?? req.user.localId);
    res.render("loginSuccess", { ...user });
  } else {
    res.redirect(req.url);
  }
});

exports.application = application;
