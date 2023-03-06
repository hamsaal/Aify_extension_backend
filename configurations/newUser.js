const keys = require("./keys");
const axios = require("axios");
const admin = require("firebase-admin");
const { emailAuth } = require("./email");

const NewUserAuth = async (data1, data2, data3) => {
  await admin
    .auth()
    .createUser({ email: data1, password: data2, displayName: data3 });
  /* await admin
    .auth()
    .generateEmailVerificationLink(data1, {
      url: "https://textaify-5d7b6.firebaseapp.com/__/auth/action",
    }); */
  await axios.post(
    "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=" +
      keys.firebase.apiKey,
    {
      requestType: "VERIFY_EMAIL",
      idToken: (await emailAuth(data1, data2)).idToken,
    },
    { headers: { "Content-Type": "application/json" } }
  );
  return;
};
module.exports = { NewUserAuth };
