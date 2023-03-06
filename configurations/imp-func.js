const admin = require("firebase-admin");
const CryptoJS = require("crypto-js");

const verifier = async (token, uid) => {
  const appchecker = await admin.auth().verifyIdToken(token);
  if (appchecker.uid !== uid) {
    throw "Token verification failed";
  }
  return appchecker;
};

const encrypt = (str) => CryptoJS.AES.encrypt(str, "Our Encryption").toString();
const decrypt = (str) =>
  CryptoJS.AES.decrypt(str, "Our Encryption").toString(CryptoJS.enc.Utf8);
module.exports = { verifier, encrypt, decrypt };
