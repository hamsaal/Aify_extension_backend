const keys = require("./keys");
const axios = require("axios");
const admin = require("firebase-admin");

const NewUserAuth = async (data1, data2, data3) => {
  await admin
    .auth()
    .createUser({ email: data1, password: data2, displayName: data3 });
  await admin.auth().generateEmailVerificationLink(data1);
  return;
};
module.exports = { NewUserAuth };
