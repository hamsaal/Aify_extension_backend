const admin = require("firebase-admin");

const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://textaify-5d7b6-default-rtdb.firebaseio.com",
});

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require("./keys");

passport.serializeUser((user, done) => {
  done(null, user.idToken);
});
passport.deserializeUser((idToken, done) => {
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((user) => {
      done(null, user);
    });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL: "http://localhost:3000/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      // Use Firebase Authentication REST API to obtain a Firebase ID token using the Google OAuth access token
      const data = "access_token=" + accessToken + "&providerId=google.com";
      const response = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=" +
          keys.firebase.apiKey,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postBody: data,
            requestUri: "http://localhost:3000/auth/google",
            returnIdpCredential: true,
            returnSecureToken: true,
          }),
        }
      );
      const jsonRes = await response.json();
      done(null, jsonRes);
    }
  )
);
