const admin = require("firebase-admin");
const CDP = require("chrome-remote-interface");
const serviceAccount = require("./service_account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com",
});

async function fetchUserByEmail(email) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord.toJSON();
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return null;
    } else {
      throw error;
    }
  }
}

async function createUserInDatabase(UEmail, UPhoto, UDisplayname) {
  try {
    await admin.auth().createUser({
      photoURL: UPhoto,
      email: UEmail,
      displayName: UDisplayname,
      disabled: false,
      emailVerified: true,
      //   providerData: [
      //     {
      //       displayName: UDisplayname,
      //       email: UEmail,
      //       phoneNumber: null,
      //       photoURL: UPhoto,
      //       providerId: "google.com",
      //     },
      //   ],
    });
    console.log("New user created in Firestore");
  } catch (error) {
    console.log("Error creating new user in Firestore:", error);
  }
}

module.exports = { fetchUserByEmail, createUserInDatabase };
