const { verifier, decrypt, reloadToken } = require("./imp-func");
const admin = require("firebase-admin");

const authCheck = async (req, res, next) => {
  if (
    !req.session.emailuser &&
    !req.session.uid &&
    !req.session.refToken &&
    !req.session.expiryTime &&
    !req.user
  ) {
    const ab = req.query.email ? true : false;
    res
      .clearCookie("userToken")
      .clearCookie("uid")
      .clearCookie("refToken")
      .clearCookie("expiryTime")
      .render("home", { unverfied: ab });
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
      let token = decrypt(req.headers["x-auth-api"]);
      const uid = decrypt(req.headers["x-auth-uid"]);
      let expiry = parseInt(req.headers["x-auth-expiry"]);
      let refToken = parseInt(req.headers["x-auth-reftoken"]);
      const now = admin.firestore.Timestamp.now().toDate().getTime();
      let expPayload = {};
      if (now >= expiry) {
        const { newToken, expiryTime, newrefToken } = reloadToken(refToken);
        token = newToken;
        refToken = newrefToken;
        expiry = expiryTime;
        expPayload = {
          token: newToken,
          refToken: newToken,
          expiry: expiryTime,
        };
      }
      const payload = await verifier(token, uid);
      if (payload.email_verified == false) {
        res.status(400).json({ error: "email_unverified" });
      }
      req.expPayload = expPayload;
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
