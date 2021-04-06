const proxy = require("http-proxy-middleware");

// This proxy redirects requests to /api endpoints to
// the Express server running on port 3001.
module.exports = function(app) {
  app.use(
    "/server-static",
    proxy({
      target: "http://localhost:3001"
    })
  );
  app.use(
    "/dir",
    proxy({
      target: "http://localhost:3001"
    })
  );
  app.use(
    "/recentlychanged",
    proxy({
      target: "http://localhost:3001"
    })
  );
  app.use(
    "/meta",
    proxy({
      target: "http://localhost:3001"
    })
  );
  app.use(
    "/loginvalidate",
    proxy({
      target: "http://localhost:3001"
    })
  );
  app.use(
    "/login",
    proxy({
      target: "http://localhost:3001"
    })
  );
};