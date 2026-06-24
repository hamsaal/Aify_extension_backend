const path = require("path");

const modulePath = path.join(__dirname, "../../routes/req-routes.js");

describe("req-routes", () => {
  const loadRoutes = ({ reqAI } = {}) => {
    const router = createFakeRouter();

    requireWithStubs(modulePath, {
      express: {
        Router: jasmine.createSpy("Router").and.returnValue(router),
      },
      "../../reqFunc": {
        reqAI:
          reqAI ??
          jasmine
            .createSpy("reqAI")
            .and.resolveTo({ code: 200, content: "AI response" }),
      },
    });

    return router;
  };

  const findRoute = (router, method, routePath) =>
    router.routes.find((route) => route.method === method && route.path === routePath);

  it("responds to the health route", () => {
    const router = loadRoutes();
    const route = findRoute(router, "get", "/");
    const res = createResponse();

    route.handlers[0]({}, res);

    expect(res.send).toHaveBeenCalledWith("Hello");
  });

  it("delegates chat requests to reqAI and returns its response", async () => {
    const reqAI = jasmine
      .createSpy("reqAI")
      .and.resolveTo({ code: 201, content: "AI response" });
    const router = loadRoutes({ reqAI });
    const route = findRoute(router, "post", "/chat");
    const req = {
      body: { prompt: "Hello" },
      expPayload: { token: "new-token" },
      uid: "user-1",
    };
    const res = createResponse();

    await route.handlers[0](req, res);

    expect(reqAI).toHaveBeenCalledWith({ prompt: "Hello" }, "user-1");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      content: "AI response",
      token: "new-token",
    });
  });
});