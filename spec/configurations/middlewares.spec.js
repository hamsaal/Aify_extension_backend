const path = require("path");

const modulePath = path.join(__dirname, "../../configurations/middlewares.js");

describe("middlewares", () => {
  const loadMiddlewares = ({
    decrypt,
    reloadToken,
    verifier,
    now = new Date("2026-06-24T12:00:00.000Z"),
  } = {}) => {
    const impFuncStub = {
      decrypt:
        decrypt ??
        jasmine.createSpy("decrypt").and.callFake((value) => {
          const values = {
            encryptedToken: "id-token",
            encryptedUid: "user-1",
            encryptedRefresh: "refresh-token",
          };

          return values[value] ?? value;
        }),
      reloadToken:
        reloadToken ??
        jasmine.createSpy("reloadToken").and.resolveTo({
          expiryTime: now.getTime() + 3400 * 1000,
          newToken: "new-id-token",
          newrefToken: "new-refresh-token",
        }),
      verifier:
        verifier ??
        jasmine
          .createSpy("verifier")
          .and.resolveTo({ uid: "user-1", email_verified: true }),
    };
    const adminStub = {
      firestore: {
        Timestamp: {
          now: () => ({
            toDate: () => now,
          }),
        },
      },
    };

    return {
      impFuncStub,
      module: requireWithStubs(modulePath, {
        "./imp-func": impFuncStub,
        "firebase-admin": adminStub,
      }),
    };
  };

  describe("authCheck", () => {
    it("renders the home page and clears auth cookies when there is no session user", async () => {
      const { module } = loadMiddlewares();
      const req = { query: { email: "unverified" }, session: {} };
      const res = createResponse();
      const next = jasmine.createSpy("next");

      await module.authCheck(req, res, next);

      expect(res.clearCookie).toHaveBeenCalledTimes(4);
      expect(res.clearedCookies).toEqual([
        "userToken",
        "uid",
        "refToken",
        "expiryTime",
      ]);
      expect(res.render).toHaveBeenCalledWith("home", { unverfied: true });
      expect(next).not.toHaveBeenCalled();
    });

    it("allows verified session users through", async () => {
      const { impFuncStub, module } = loadMiddlewares();
      const req = {
        query: {},
        session: {
          emailuser: "id-token",
          uid: "user-1",
          refToken: "refresh-token",
          expiryTime: Date.now() + 10000,
        },
      };
      const res = createResponse();
      const next = jasmine.createSpy("next");

      await module.authCheck(req, res, next);

      expect(impFuncStub.verifier).toHaveBeenCalledWith("id-token", "user-1");
      expect(next).toHaveBeenCalled();
    });

    it("redirects unverified session users", async () => {
      const verifier = jasmine
        .createSpy("verifier")
        .and.resolveTo({ uid: "user-1", email_verified: false });
      const { module } = loadMiddlewares({ verifier });
      const req = {
        query: {},
        session: {
          emailuser: "id-token",
          uid: "user-1",
          refToken: "refresh-token",
          expiryTime: Date.now() + 10000,
        },
      };
      const res = createResponse();
      const next = jasmine.createSpy("next");

      await module.authCheck(req, res, next);

      expect(req.session).toBeNull();
      expect(res.redirect).toHaveBeenCalledWith("/?email=unverified");
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("authCheck2", () => {
    const requestWithHeaders = (overrides = {}) => ({
      headers: {
        "x-auth-api": "encryptedToken",
        "x-auth-expiry": String(Date.parse("2026-06-24T13:00:00.000Z")),
        "x-auth-reftoken": "encryptedRefresh",
        "x-auth-uid": "encryptedUid",
        ...overrides,
      },
    });

    it("rejects missing auth headers", async () => {
      const { module } = loadMiddlewares();
      const req = { headers: {} };
      const res = createResponse();
      const next = jasmine.createSpy("next");

      await module.authCheck2(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "unauthenticated" });
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects invalid expiry headers", async () => {
      const { module } = loadMiddlewares();
      const req = requestWithHeaders({ "x-auth-expiry": "not-a-number" });
      const res = createResponse();
      const next = jasmine.createSpy("next");

      await module.authCheck2(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "unauthenticated" });
      expect(next).not.toHaveBeenCalled();
    });

    it("decrypts and verifies valid request headers", async () => {
      const { impFuncStub, module } = loadMiddlewares();
      const req = requestWithHeaders();
      const res = createResponse();
      const next = jasmine.createSpy("next");

      await module.authCheck2(req, res, next);

      expect(impFuncStub.decrypt.calls.allArgs()).toEqual([
        ["encryptedToken"],
        ["encryptedUid"],
        ["encryptedRefresh"],
      ]);
      expect(impFuncStub.verifier).toHaveBeenCalledWith("id-token", "user-1");
      expect(req.uid).toBe("user-1");
      expect(req.expPayload).toEqual({});
      expect(next).toHaveBeenCalled();
    });

    it("refreshes expired tokens and exposes the new token payload", async () => {
      const now = new Date("2026-06-24T12:00:00.000Z");
      const { impFuncStub, module } = loadMiddlewares({ now });
      const req = requestWithHeaders({
        "x-auth-expiry": String(now.getTime() - 1),
      });
      const res = createResponse();
      const next = jasmine.createSpy("next");

      await module.authCheck2(req, res, next);

      expect(impFuncStub.reloadToken).toHaveBeenCalledWith("refresh-token");
      expect(impFuncStub.verifier).toHaveBeenCalledWith(
        "new-id-token",
        "user-1"
      );
      expect(req.expPayload).toEqual({
        expiry: now.getTime() + 3400 * 1000,
        refToken: "new-refresh-token",
        token: "new-id-token",
      });
      expect(next).toHaveBeenCalled();
    });

    it("rejects unverified emails without calling the next handler", async () => {
      const verifier = jasmine
        .createSpy("verifier")
        .and.resolveTo({ uid: "user-1", email_verified: false });
      const { module } = loadMiddlewares({ verifier });
      const req = requestWithHeaders();
      const res = createResponse();
      const next = jasmine.createSpy("next");

      await module.authCheck2(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "email_unverified" });
      expect(next).not.toHaveBeenCalled();
    });
  });
});