const admin = require("firebase-admin");
const verifier = async (token, uid) => {
  const appchecker = await admin.auth().verifyIdToken(token);
  if (appchecker.uid !== uid) {
    throw "Token verification failed";
  }
  return appchecker;
};
module.exports = { verifier };
