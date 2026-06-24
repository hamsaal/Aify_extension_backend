const path = require("path");

const modulePath = path.join(__dirname, "../../configurations/imp-func.js");

describe("imp-func", () => {
  const loadModule = ({ verifyIdToken, axiosPost, now } = {}) => {
    const firebaseNow = now ?? new Date("2026-06-24T12:00:00.000Z");
    const adminStub = {
      auth: () => ({
        verifyIdToken:
          verifyIdToken ??
          jasmine.createSpy("verifyIdToken").and.resolveTo({
            uid: "user-1",
            email_verified: true,
          }),
      }),
      firestore: {
        Timestamp: {
          now: () => ({
            toDate: () => firebaseNow,
          }),
        },
      },
    };
    const cryptoStub = {
      AES: {
        encrypt: jasmine
          .createSpy("encrypt")
          .and.callFake((value, secret) => ({
            toString: () => `${secret}:${value}`,
          })),
        decrypt: jasmine
          .createSpy("decrypt")
          .and.callFake((value, secret) => ({
            toString: () => value.replace(`${secret}:`, ""),
          })),
      },
      enc: {
        Utf8: "utf8",
      },
    };
    const axiosStub = {
      post:
        axiosPost ??
        jasmine.createSpy("post").and.resolveTo({
          data: {
            expires_in: "3600",
            id_token: "new-id-token",
            refresh_token: "new-refresh-token",
          },
        }),
    };
    const keysStub = {
      firebase: {
        apiKey: "firebase-api-key",
      },
    };

    return {
      cryptoStub,
      axiosStub,
      module: requireWithStubs(modulePath, {
        "firebase-admin": adminStub,
        "crypto-js": cryptoStub,
        axios: axiosStub,
        "./keys": keysStub,
      }),
    };
  };

  it("verifies a token for the expected user id", async () => {
    const verifyIdToken = jasmine
      .createSpy("verifyIdToken")
      .and.resolveTo({ uid: "user-1", email_verified: true });
    const { module } = loadModule({ verifyIdToken });

    const payload = await module.verifier("id-token", "user-1");

    expect(verifyIdToken).toHaveBeenCalledWith("id-token");
    expect(payload).toEqual({ uid: "user-1", email_verified: true });
  });

  it("rejects a token whose uid does not match the expected user id", async () => {
    const verifyIdToken = jasmine
      .createSpy("verifyIdToken")
      .and.resolveTo({ uid: "other-user", email_verified: true });
    const { module } = loadModule({ verifyIdToken });

    await expectAsync(module.verifier("id-token", "user-1")).toBeRejectedWith(
      "Token verification failed"
    );
  });

  it("uses a matching encryption key for encrypt and decrypt", () => {
    const { cryptoStub, module } = loadModule();

    const encrypted = module.encrypt("plain-token");
    const decrypted = module.decrypt(encrypted);

    expect(decrypted).toBe("plain-token");
    expect(cryptoStub.AES.encrypt).toHaveBeenCalledWith(
      "plain-token",
      "Our Encryption"
    );
    expect(cryptoStub.AES.decrypt).toHaveBeenCalledWith(
      "Our Encryption:plain-token",
      "Our Encryption"
    );
  });

  it("refreshes Firebase tokens using the configured API key", async () => {
    const now = new Date("2026-06-24T12:00:00.000Z");
    const { axiosStub, module } = loadModule({ now });

    const refreshed = await module.reloadToken("refresh-token");

    expect(axiosStub.post).toHaveBeenCalledWith(
      "https://securetoken.googleapis.com/v1/token?key=firebase-api-key",
      {
        grant_type: "refresh_token",
        refresh_token: "refresh-token",
      },
      { headers: { "Content-Type": "application/json" } }
    );
    expect(refreshed).toEqual({
      newToken: "new-id-token",
      newrefToken: "new-refresh-token",
      expiryTime: now.getTime() + 3400 * 1000,
    });
  });
});