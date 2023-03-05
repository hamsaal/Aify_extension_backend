const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const expressSession = require("express-session");
const FirestoreStore = require("connect-session-firebase")(expressSession);
const path = require("path");
const authRoutes = require("./routes/auth-routes");
const reqRoutes = require("./routes/req-routes");
const application = express();
var cors = require("cors");
const { authCheck2, authCheck } = require("./configurations/middlewares");
const admin = require("firebase-admin");
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
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 31 * 24 * 60 * 60 * 1000,
      secure: false,
      httpOnly: false,
    },
  })
);
application.use(passport.initialize());
application.use(passport.session());
application.use("/auth", authRoutes);
application.use("/req", authCheck2, reqRoutes);
application.get("/", authCheck, async (req, res) => {
  if (req.session) {
    const user = await admin.auth().getUser(req.session.uid);
    res.render("loginSuccess", { ...user });
  } else {
    res.redirect(req.url);
  }
});

exports.application = application;
