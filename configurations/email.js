const keys = require("./keys");

const emailAuth = async (data1, data2) => {
  const abc = await axios.post(
    "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" +
      keys.firebase.apiKey,
    {
      email: data1,
      password: data2,
      returnSecureToken: true,
    }
  );
  const firebaseUser = abc.body;
  return firebaseUser;
};
module.exports = { emailAuth };
