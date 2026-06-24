const path = require("path");

const modulePath = path.join(__dirname, "../../routes/auth-routes.js");

describe("auth-routes", () => {
  const loadRoutes = ({ emailAuth, NewUserAuth } = {}) => {
    const router = createFakeRouter();
    const now = new Date("2026-06-24T12:00:00.000Z");
    const passportMiddleware = jasmine.createSpy("passportMiddleware");
    const passportStub = {
      authenticate: jasmine
        .createSpy("authenticate")
        .and.returnValue(passportMiddleware),
    };
    const stubs = {
      express: {
        Router: jasmine.createSpy("Router").and.returnValue(router),
      },
      "../configurations/email": {
        emailAuth:
          emailAuth ??
          jasmine.createSpy("emailAuth").and.resolveTo({
            expiresIn: "3600",
            idToken: "id-token",
            localId: "user-1",
            refreshToken: "refresh-token",
          }),
      },
      passport: passportStub,
      "../configurations/newUser": {
        NewUserAuth:
          NewUserAuth ?? jasmine.createSpy("NewUserAuth").and.resolveTo(),
      },
      "firebase-admin": {
        firestore: {
          Timestamp: {
            now: () => ({
              toDate: () => now,
            }),
          },
        },
      },
      "../configurations/imp-func": {
        encrypt: jasmine
          .createSpy("encrypt")
          .and.callFake((value) => `encrypted:${value}`),
      },
      "../configurations/keys": {
        options: {
          httpOnly: true,
          secure: true,
        },
      },
    };

    requireWithStubs(modulePath, stubs);

    return {
      now,
      passportStub,
      router,
      stubs,
    };
  };

  const findRoute = (router, method, routePath) =>
    router.routes.find((route) => route.method === method && route.path === routePath);

  it("sets session values and cookies after email login", async () => {
    const emailAuth = jasmine.createSpy("emailAuth").and.resolveTo({
      expiresIn: "3600",
      idToken: "id-token",
      localId: "user-1",
      refreshToken: "refresh-token",
    });
    const { now, router } = loadRoutes({ emailAuth });
    const route = findRoute(router, "post", "/email");
    const req = {
      body: { email: "person@example.com", password: "password" },
      session: {},
    };
    const res = createResponse();

    await route.handlers[0](req, res);

    expect(emailAuth).toHaveBeenCalledWith("person@example.com", "password");
    expect(req.session).toEqual({
      emailuser: "id-token",
      expiryTime: new Date(now.getTime() + 3400 * 1000),
      refToken: "refresh-token",
      uid: "user-1",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookies).toEqual([
      {
        name: "userToken",
        options: { httpOnly: true, secure: true },
        value: "encrypted:id-token",
      },
      {
        name: "uid",
        options: { httpOnly: true, secure: true },
        value: "encrypted:user-1",
      },
      {
        name: "refToken",
        options: { httpOnly: true, secure: true },
        value: "encrypted:refresh-token",
      },
      {
        name: "expiryTime",
        options: { httpOnly: true, secure: true },
        value: now.getTime() + 3400 * 1000,
      },
    ]);
    expect(res.send).toHaveBeenCalledWith("Success");
  });

  it("formats Firebase email login errors for the client", async () => {
    const emailAuth = jasmine
      .createSpy("emailAuth")
      .and.rejectWith({
        response: {
          data: {
            error: {
              message: "INVALID_PASSWORD",
            },
          },
        },
      });
    const { router } = loadRoutes({ emailAuth });
    const route = findRoute(router, "post", "/email");
    const req = {
      body: { email: "person@example.com", password: "bad-password" },
      session: {},
    };
    const res = createResponse();
    spyOn(console, "log");

    await route.handlers[0](req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("INVALID PASSWORD");
  });

  it("registers new users", async () => {
    const NewUserAuth = jasmine.createSpy("NewUserAuth").and.resolveTo();
    const { router } = loadRoutes({ NewUserAuth });
    const route = findRoute(router, "post", "/register");
    const req = {
      body: {
        email: "person@example.com",
        name: "Person Name",
        password: "password",
      },
    };
    const res = createResponse();

    await route.handlers[0](req, res);

    expect(NewUserAuth).toHaveBeenCalledWith(
      "person@example.com",
      "password",
      "Person Name"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Success");
  });

  it("registers Google OAuth routes with Passport", () => {
    const { passportStub, router } = loadRoutes();

    expect(findRoute(router, "get", "/google")).toBeDefined();
    expect(findRoute(router, "get", "/google/redirect")).toBeDefined();
    expect(passportStub.authenticate).toHaveBeenCalledWith("google", {
      scope: ["profile", "email", "openid"],
    });
    expect(passportStub.authenticate).toHaveBeenCalledWith("google", {
      failureRedirect: "/",
    });
  });
});