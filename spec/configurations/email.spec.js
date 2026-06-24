const path = require("path");

const modulePath = path.join(__dirname, "../../configurations/email.js");

describe("emailAuth", () => {
  it("sends Firebase email/password login requests", async () => {
    const axiosStub = {
      post: jasmine.createSpy("post").and.resolveTo({
        data: {
          idToken: "id-token",
          localId: "user-1",
        },
      }),
    };
    const keysStub = {
      firebase: {
        apiKey: "firebase-api-key",
      },
    };
    const { emailAuth } = requireWithStubs(modulePath, {
      "./keys": keysStub,
      axios: axiosStub,
    });

    const user = await emailAuth("person@example.com", "password");

    expect(axiosStub.post).toHaveBeenCalledWith(
      "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=firebase-api-key",
      {
        email: "person@example.com",
        password: "password",
        returnSecureToken: true,
      },
      { headers: { "Content-Type": "application/json" } }
    );
    expect(user).toEqual({
      idToken: "id-token",
      localId: "user-1",
    });
  });
});