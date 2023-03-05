const { verifier } = require("./imp-func");

const authCheck = async (req, res, next) => {
  if (
    !req.session.emailuser &&
    !req.session.uid &&
    !req.session.refToken &&
    !req.session.expiryTime
  ) {
    req.query.email
      ? res.render("home", { unverfied: true })
      : res.render("home", { unverfied: false });
  } else {
    try {
      const payload = await verifier(req.session.emailuser, req.session.uid);
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
  if (
    !req.session.emailuser &&
    !req.session.uid &&
    !req.session.refToken &&
    !req.session.expiryTime
  ) {
    res.status(400).json({ error: "unauthenticated" });
  } else {
    try {
      const payload = await verifier(req.session.emailuser, req.session.uid);
      if (payload.email_verified == false) {
        res.status(400).json({ error: "email_unverified" });
      }
      next();
    } catch (e) {
      res.status(400).send(e);
    }
  }
};
module.exports = { authCheck, authCheck2 };
