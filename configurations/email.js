const keys = require("./keys");

const emailAuth = async (data1, data2) => {
  const abc = await fetch(
    "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" +
      keys.firebase.apiKey,
    {
      method: "POST",
      body: JSON.stringify({
        email: data1,
        password: data2,
        returnSecureToken: true,
      }),
    }
  );
  const firebaseUser = await abc.json();
  return firebaseUser;
};
module.exports = { emailAuth };
