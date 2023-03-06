const admin = require("firebase-admin");
const CryptoJS = require("crypto-js");
const axios = require("axios");

const verifier = async (token, uid) => {
  const appchecker = await admin.auth().verifyIdToken(token);
  if (appchecker.uid !== uid) {
    throw "Token verification failed";
  }
  return appchecker;
};

const reloadToken = async (refToken) => {
  const abc = await axios.post(
    "https://securetoken.googleapis.com/v1/token?key=" + keys.firebase.apiKey,
    {
      grant_type: "refresh_token",
      refresh_token: refToken,
    },
    { headers: { "Content-Type": "application/json" } }
  );
  const resp = abc.data;
  const now = admin.firestore.Timestamp.now().toDate();
  const oneHourLater = new Date(
    now.getTime() + (parseInt(resp.expires_in) - 200) * 1000
  );
  return {
    newToken: resp.id_token,
    newrefToken: resp.refresh_token,
    expiryTime: oneHourLater.getTime(),
  };
};

const encrypt = (str) => CryptoJS.AES.encrypt(str, "Our Encryption").toString();
const decrypt = (str) =>
  CryptoJS.AES.decrypt(str, "Our Encryption").toString(CryptoJS.enc.Utf8);
module.exports = { verifier, encrypt, decrypt, reloadToken };
