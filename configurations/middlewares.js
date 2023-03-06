const { verifier, decrypt } = require("./imp-func");

const authCheck = async (req, res, next) => {
  if (
    !req.session.emailuser &&
    !req.session.uid &&
    !req.session.refToken &&
    !req.session.expiryTime &&
    !req.user
  ) {
    req.query.email
      ? res.render("home", { unverfied: true })
      : res.render("home", { unverfied: false });
  } else {
    try {
      const payload = await verifier(
        req.session.emailuser ?? req.user.idToken,
        req.session.uid ?? req.user.localId
      );
      if (payload.email_verified == false) {
        req.session = null;
        res.redirect("/?email=unverified");
      } else {
        next();
      }
    } catch (e) {
      res.status(400).send(e);
    }
  }
};

const authCheck2 = async (req, res, next) => {
  if (!req.headers["x-auth-api"] && !req.headers["x-auth-uid"]) {
    res.status(400).json({ error: "unauthenticated" });
  } else {
    try {
      const token = decrypt(req.headers["x-auth-api"]);
      const uid = decrypt(req.headers["x-auth-uid"]);
      const payload = await verifier(token, uid);
      if (payload.email_verified == false) {
        res.status(400).json({ error: "email_unverified" });
      }
      req.uid = uid;
      next();
    } catch (e) {
      res
        .status(400)
        .send(e ?? "An error occurred while verifying credentials");
    }
  }
};
module.exports = { authCheck, authCheck2 };
