const path = require("path");

const modulePath = path.join(__dirname, "../../configurations/newUser.js");

describe("NewUserAuth", () => {
  it("creates a Firebase user and sends an email verification code", async () => {
    const createUser = jasmine.createSpy("createUser").and.resolveTo();
    const emailAuth = jasmine
      .createSpy("emailAuth")
      .and.resolveTo({ idToken: "id-token" });
    const axiosStub = {
      post: jasmine.createSpy("post").and.resolveTo({ data: {} }),
    };
    const keysStub = {
      firebase: {
        apiKey: "firebase-api-key",
      },
    };
    const adminStub = {
      auth: () => ({
        createUser,
      }),
    };
    const { NewUserAuth } = requireWithStubs(modulePath, {
      "./keys": keysStub,
      axios: axiosStub,
      "firebase-admin": adminStub,
      "./email": { emailAuth },
    });

    await NewUserAuth("person@example.com", "password", "Person Name");

    expect(createUser).toHaveBeenCalledWith({
      displayName: "Person Name",
      email: "person@example.com",
      password: "password",
    });
    expect(emailAuth).toHaveBeenCalledWith("person@example.com", "password");
    expect(axiosStub.post).toHaveBeenCalledWith(
      "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=firebase-api-key",
      {
        idToken: "id-token",
        requestType: "VERIFY_EMAIL",
      },
      { headers: { "Content-Type": "application/json" } }
    );
  });
});