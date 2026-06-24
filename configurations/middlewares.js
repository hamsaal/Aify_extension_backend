const { verifier, decrypt, reloadToken } = require("./imp-func");
const admin = require("firebase-admin");

const authCheck = async (req, res, next) => {
  const session = req.session ?? {};
  if (
    !session.emailuser &&
    !session.uid &&
    !session.refToken &&
    !session.expiryTime &&
    !req.user
  ) {
    const ab = req.query.email ? true : false;
    return res
      .clearCookie("userToken")
      .clearCookie("uid")
      .clearCookie("refToken")
      .clearCookie("expiryTime")
      .render("home", { unverfied: ab });
  } else {
    try {
      const payload = await verifier(
        session.emailuser ?? req.user.idToken,
        session.uid ?? req.user.localId
      );
      if (payload.email_verified == false) {
        req.session = null;
        return res.redirect("/?email=unverified");
      } else {
        return next();
      }
    } catch (e) {
      return res.status(400).send(e);
    }
  }
};

const authCheck2 = async (req, res, next) => {
  const apiHeader = req.headers["x-auth-api"];
  const uidHeader = req.headers["x-auth-uid"];
  const expiryHeader = req.headers["x-auth-expiry"];
  const refTokenHeader = req.headers["x-auth-reftoken"];

  if (!apiHeader || !uidHeader || !expiryHeader || !refTokenHeader) {
    return res.status(400).json({ error: "unauthenticated" });
  } else {
    try {
      let token = decrypt(apiHeader);
      const uid = decrypt(uidHeader);
      let expiry = parseInt(expiryHeader, 10);
      let refToken = decrypt(refTokenHeader);
      const now = admin.firestore.Timestamp.now().toDate().getTime();
      let expPayload = {};

      if (Number.isNaN(expiry)) {
        return res.status(400).json({ error: "unauthenticated" });
      }

      if (now >= expiry) {
        const { newToken, expiryTime, newrefToken } = await reloadToken(refToken);
        token = newToken;
        refToken = newrefToken;
        expiry = expiryTime;
        expPayload = {
          token: newToken,
          refToken: newrefToken,
          expiry: expiryTime,
        };
      }
      const payload = await verifier(token, uid);
      if (payload.email_verified == false) {
        return res.status(400).json({ error: "email_unverified" });
      }
      req.expPayload = expPayload;
      req.uid = uid;
      return next();
    } catch (e) {
      return res
        .status(400)
        .send(e ?? "An error occurred while verifying credentials");
    }
  }
};
module.exports = { authCheck, authCheck2 };