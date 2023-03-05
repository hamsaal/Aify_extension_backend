// const serviceAccount = require("./service-account.json");
const admin = require("firebase-admin");
/* admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://textaify-5d7b6-default-rtdb.firebaseio.com",
});
 */
const axios = require("axios");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require("./keys");

passport.serializeUser((user, done) => {
  done(null, user.idToken);
});
passport.deserializeUser((idToken, done) => {
  console.log(idToken);
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((user) => {
      done(null, user);
    });
  // .verifySessionCookie()
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL: "https://auth.textaify.com/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Access Token", accessToken);
      // Use Firebase Authentication REST API to obtain a Firebase ID token using the Google OAuth access token
      const data = "access_token=" + accessToken + "&providerId=google.com";
      const response = await axios.post(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=" +
          keys.firebase.apiKey,
        {
          postBody: data,
          requestUri: "https://auth.textaify.com/auth/google",
          returnIdpCredential: true,
          returnSecureToken: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const jsonRes = response.data;
      // admin.auth().createSessionCookie(jsonRes.idToken);
      done(null, jsonRes);
    }
  )
);
