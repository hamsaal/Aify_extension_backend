const keys = require("./keys");
const axios = require("axios");
const emailAuth = async (data1, data2) => {
  const abc = await axios.post(
    "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" +
      keys.firebase.apiKey,
    {
      email: data1,
      password: data2,
      returnSecureToken: true,
    },
    { headers: { "Content-Type": "application/json" } }
  );
  const firebaseUser = abc.data;
  return firebaseUser;
};
module.exports = { emailAuth };
