const axios = require("axios");
const admin = require("firebase-admin");

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require("./keys");

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL: "http://localhost:5000/auth/google/redirect",
      scope: ["profile", "email", "openid"],
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
          requestUri: "http://localhost:5000/auth/google",
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
