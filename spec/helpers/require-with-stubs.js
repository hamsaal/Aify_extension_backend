const Module = require("module");

global.requireWithStubs = (modulePath, stubs = {}) => {
  const resolvedPath = require.resolve(modulePath);
  const originalLoad = Module._load;

  delete require.cache[resolvedPath];

  Module._load = function loadWithStubs(request, parent, isMain) {
    if (Object.prototype.hasOwnProperty.call(stubs, request)) {
      return stubs[request];
    }

    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    return require(resolvedPath);
  } finally {
    Module._load = originalLoad;
  }
};

global.createResponse = () => {
  const res = {
    body: undefined,
    cookies: [],
    clearedCookies: [],
    redirectedTo: undefined,
    rendered: undefined,
    statusCode: undefined,
  };

  res.status = jasmine.createSpy("status").and.callFake((code) => {
    res.statusCode = code;
    return res;
  });
  res.cookie = jasmine.createSpy("cookie").and.callFake((name, value, options) => {
    res.cookies.push({ name, value, options });
    return res;
  });
  res.clearCookie = jasmine.createSpy("clearCookie").and.callFake((name) => {
    res.clearedCookies.push(name);
    return res;
  });
  res.send = jasmine.createSpy("send").and.callFake((body) => {
    res.body = body;
    return res;
  });
  res.json = jasmine.createSpy("json").and.callFake((body) => {
    res.body = body;
    return res;
  });
  res.render = jasmine.createSpy("render").and.callFake((view, model) => {
    res.rendered = { view, model };
    return res;
  });
  res.redirect = jasmine.createSpy("redirect").and.callFake((target) => {
    res.redirectedTo = target;
    return res;
  });

  return res;
};

global.createFakeRouter = () => {
  const router = {
    routes: [],
  };

  const record = (method) =>
    jasmine.createSpy(method).and.callFake((routePath, ...handlers) => {
      router.routes.push({ method, path: routePath, handlers });
      return router;
    });

  router.get = record("get");
  router.post = record("post");

  return router;
};